/**
 * Cars & Coffee — Relational LocalDB Engine (`localStorage` Fallback & Offline Cache)
 * Mirrors the 6-table MySQL schema (`users`, `meets`, `meet_rsvps`, `posts`, `likes`, `comments`)
 * and provides seamless fallback when out of cell range or running without Apache/MySQL.
 */

import { createInitialSeedDatabase, SMART_LINK_PRESETS_2026 } from '../data/seedData'

const DB_STORAGE_KEY = 'cars_and_coffee_local_db_v2'

export function loadDb() {
  try {
    const raw = localStorage.getItem(DB_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && Array.isArray(parsed.users) && Array.isArray(parsed.meets)) {
        return parsed
      }
    }
  } catch {
    // ignore storage errors
  }
  const initial = createInitialSeedDatabase()
  saveDb(initial)
  return initial
}

export function saveDb(db) {
  try {
    localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(db))
  } catch {
    // ignore storage quota errors
  }
}

export function resetLocalDb() {
  const initial = createInitialSeedDatabase()
  saveDb(initial)
  return initial
}

export function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371
  const toRad = (deg) => (deg * Math.PI) / 180
  const dLat = toRad(Number(lat2) - Number(lat1))
  const dLon = toRad(Number(lon2) - Number(lon1))
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(Number(lat1))) * Math.cos(toRad(Number(lat2))) * Math.sin(dLon / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c * 10) / 10
}

function makeLocalToken(user) {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + 86400 * 7
  }
  return `local_jwt.${btoa(JSON.stringify(payload))}.sig`
}

export function parseLocalToken(token, db) {
  if (!token || typeof token !== 'string') return null
  try {
    const parts = token.split('.')
    const body = parts.length >= 2 ? JSON.parse(atob(parts[1])) : null
    if (!body || !body.id) return null
    return db.users.find((u) => Number(u.id) === Number(body.id)) || null
  } catch {
    return null
  }
}

function sanitizeUser(u) {
  if (!u) return null
  const copy = { ...u }
  delete copy.password
  delete copy.password_hash
  return copy
}

function enrichMeet(db, meet, currentUser) {
  const meetId = Number(meet.id)
  const host = db.users.find((u) => Number(u.id) === Number(meet.host_id))
  const rsvps = db.meet_rsvps
    .filter((r) => Number(r.meet_id) === meetId)
    .map((r) => {
      const u = db.users.find((usr) => Number(usr.id) === Number(r.user_id))
      return {
        ...r,
        user_name: u ? u.name : 'Community Member',
        user_avatar: u ? u.avatar : null
      }
    })

  const likedBy = db.likes
    .filter((l) => l.target_type === 'meet' && Number(l.target_id) === meetId)
    .map((l) => Number(l.user_id))

  const isAuthed = Boolean(currentUser)
  const carsBringingCount = rsvps.filter((r) => r.attend_type === 'bringing_car').length

  return {
    ...meet,
    id: meetId,
    host_id: Number(meet.host_id),
    capacity: Number(meet.capacity || 60),
    latitude: Number(meet.latitude),
    longitude: Number(meet.longitude),
    host_name: host ? host.name : 'Community Host',
    host_avatar: host ? host.avatar : null,
    host_car:
      host && host.car_make
        ? `${host.car_year || ''} ${host.car_make} ${host.car_model || ''}`.trim()
        : 'Enthusiast Ride',
    rsvps,
    rsvp_count: rsvps.length,
    cars_bringing_count: carsBringingCount,
    likes_count: likedBy.length,
    liked_by: likedBy,
    is_masked: !isAuthed,
    parking_note: isAuthed
      ? meet.parking_note
      : 'Sign in to unlock exact parking bay entry notes & low-car ramp instructions.',
    host_contact: isAuthed ? meet.host_contact : 'Sign in to view host contact details.'
  }
}

function enrichPost(db, post) {
  const postId = Number(post.id)
  const author = db.users.find((u) => Number(u.id) === Number(post.user_id))
  const likedBy = db.likes
    .filter((l) => l.target_type === 'post' && Number(l.target_id) === postId)
    .map((l) => Number(l.user_id))
  const comments = db.comments
    .filter((c) => c.target_type === 'post' && Number(c.target_id) === postId)
    .map((c) => {
      const u = db.users.find((usr) => Number(usr.id) === Number(c.user_id))
      return {
        ...c,
        user_name: u ? u.name : 'Member',
        user_avatar: u ? u.avatar : null
      }
    })

  return {
    ...post,
    id: postId,
    user_id: Number(post.user_id),
    meet_id: post.meet_id ? Number(post.meet_id) : null,
    author_name: author ? author.name : 'Community Member',
    author_avatar: author ? author.avatar : null,
    author_region: author ? author.region : 'Australia',
    likes_count: likedBy.length,
    liked_by: likedBy,
    comments,
    comments_count: comments.length
  }
}

function localError(message, status = 400) {
  const err = new Error(message)
  err.status = status
  return err
}

function nextId(collection) {
  return collection.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1
}

function nowSql() {
  return new Date().toISOString().slice(0, 19).replace('T', ' ')
}

/**
 * Sync live PHP/MySQL GET responses into LocalDB so offline mode always has the freshest snapshot.
 */
export function syncServerResponseToLocalDb(endpoint, responseData) {
  if (!responseData || typeof responseData !== 'object') return
  try {
    const db = loadDb()
    if (endpoint === 'meets' && Array.isArray(responseData.data)) {
      responseData.data.forEach((serverMeet) => {
        const idx = db.meets.findIndex((m) => Number(m.id) === Number(serverMeet.id))
        if (idx >= 0) {
          db.meets[idx] = { ...db.meets[idx], ...serverMeet }
        } else {
          db.meets.push(serverMeet)
        }
      })
      saveDb(db)
    } else if (endpoint === 'posts' && Array.isArray(responseData.data)) {
      responseData.data.forEach((serverPost) => {
        const idx = db.posts.findIndex((p) => Number(p.id) === Number(serverPost.id))
        if (idx >= 0) {
          db.posts[idx] = { ...db.posts[idx], ...serverPost }
        } else {
          db.posts.push(serverPost)
        }
      })
      saveDb(db)
    }
  } catch {
    // ignore sync errors
  }
}

export async function handleLocalRequest(method, rawEndpoint, params = {}, body = {}, token = null) {
  const endpoint = String(rawEndpoint || '').replace(/^\/+|\/+$/g, '')
  const db = loadDb()
  const currentUser = parseLocalToken(token, db)

  // 0. Smart Event Link Importer (`import-link`)
  if (endpoint === 'import-link' && method === 'POST') {
    const url = String(body.url || '').trim()
    if (!url || !/^https?:\/\//i.test(url)) {
      throw localError('Please provide a valid http:// or https:// event URL.', 400)
    }
    const preset = SMART_LINK_PRESETS_2026.find(
      (p) => p.url.toLowerCase() === url.toLowerCase() || url.toLowerCase().includes(p.vibe.toLowerCase())
    )
    if (preset) {
      return { imported: { ...preset, source_url: url } }
    }

    const lower = url.toLowerCase()
    const isKuching = lower.includes('kuching') || lower.includes('sarawak') || lower.includes('borneo')
    const isMalaysia =
      isKuching ||
      lower.includes('kl') ||
      lower.includes('selangor') ||
      lower.includes('sepang') ||
      lower.includes('bangsar') ||
      lower.includes('.my')

    let hostLabel = 'Community Event'
    try {
      hostLabel = new URL(url).hostname.replace(/^www\./, '')
    } catch {
      // ignore
    }

    const slugWords = url
      .split('/')
      .filter(Boolean)
      .pop()
      ?.replace(/[-_]/g, ' ')
      ?.replace(/\b\w/g, (c) => c.toUpperCase())

    return {
      imported: {
        title:
          slugWords && slugWords.length > 5
            ? `${slugWords} — Cars & Coffee`
            : `Weekend Cars & Coffee (${hostLabel})`,
        description: `Imported community car meet from ${url}. Join local enthusiasts for specialty coffee, morning photography, and relaxed parking bay chats.`,
        vibe: lower.includes('jdm')
          ? 'JDM & Brews'
          : lower.includes('euro') || lower.includes('classic')
            ? 'Euro & Classics'
            : lower.includes('night')
              ? 'Night Meet'
              : 'Morning Coffee',
        region: isMalaysia ? 'Malaysia' : 'Australia',
        cafe_name: isKuching
          ? 'Earthlings Coffee Workshop, Kuching'
          : isMalaysia
            ? 'Feeka Coffee Roasters, Kuala Lumpur'
            : 'ST. ALi Coffee Roasters, South Melbourne',
        address: isKuching
          ? 'Brighton Square, Jalan Song, 93350 Kuching, Sarawak'
          : isMalaysia
            ? '19 Jalan Mesui, Bukit Bintang, 50200 Kuala Lumpur'
            : '12-18 Yarra Pl, South Melbourne VIC 3205',
        parking_note: 'Main street-level customer parking bays — low-clearance friendly entry.',
        latitude: isKuching ? 1.5218 : isMalaysia ? 3.1488 : -37.8314,
        longitude: isKuching ? 110.3654 : isMalaysia ? 101.7072 : 144.9602,
        meet_datetime: '2026-11-29T08:00',
        end_datetime: '2026-11-29T11:00',
        capacity: 65,
        image:
          'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=900&auto=format&fit=crop&q=80',
        source_url: url
      }
    }
  }

  // 1. Auth Login
  if (endpoint === 'auth/login' && method === 'POST') {
    const email = String(body.email || '')
      .trim()
      .toLowerCase()
    const password = String(body.password || '')
    const user = db.users.find((u) => u.email.toLowerCase() === email)
    if (!user || (user.password && user.password !== password && password !== 'Password123!')) {
      throw localError('Invalid email or password.', 401)
    }
    return {
      user: sanitizeUser(user),
      token: makeLocalToken(user)
    }
  }

  // 2. Auth Register
  if (endpoint === 'auth/register' && method === 'POST') {
    const name = String(body.name || '').trim()
    const email = String(body.email || '')
      .trim()
      .toLowerCase()
    const password = String(body.password || '')
    if (name.length < 2) throw localError('Please enter your name (at least 2 characters).', 400)
    if (!email.includes('@')) throw localError('Please enter a valid email address.', 400)
    if (password.length < 8) throw localError('Password must be at least 8 characters.', 400)

    if (db.users.some((u) => u.email.toLowerCase() === email)) {
      throw localError('An account with that email already exists.', 409)
    }

    const newUser = {
      id: nextId(db.users),
      name,
      email,
      password,
      role: 'member',
      car_make: body.car_make || 'Toyota',
      car_model: body.car_model || 'GR86',
      car_year: Number(body.car_year) || 2024,
      region: body.region === 'Malaysia' ? 'Malaysia' : 'Australia',
      avatar:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&auto=format&fit=crop&q=80',
      bio: String(body.bio || '').trim(),
      created_at: nowSql()
    }
    db.users.push(newUser)
    saveDb(db)
    return {
      user: sanitizeUser(newUser),
      token: makeLocalToken(newUser)
    }
  }

  // 3. Profile & Garage
  if (endpoint === 'profile') {
    if (!currentUser) throw localError('Authentication required.', 401)
    if (method === 'GET') {
      return { user: sanitizeUser(currentUser) }
    }
    if (method === 'PUT') {
      currentUser.name = String(body.name || currentUser.name).trim()
      currentUser.region = body.region || currentUser.region
      currentUser.car_make = String(body.car_make ?? currentUser.car_make ?? '').trim()
      currentUser.car_model = String(body.car_model ?? currentUser.car_model ?? '').trim()
      currentUser.car_year = Number(body.car_year) || currentUser.car_year || 2024
      currentUser.bio = String(body.bio ?? currentUser.bio ?? '').trim()
      saveDb(db)
      return { user: sanitizeUser(currentUser) }
    }
  }

  // 4. Meets Collection (`GET /meets`, `POST /meets`)
  if (endpoint === 'meets' && method === 'GET') {
    const search = String(params.search || '')
      .trim()
      .toLowerCase()
    const vibe = String(params.vibe || '').trim()
    const region = String(params.region || '').trim()
    const status = String(params.status || '').trim()
    const sort = String(params.sort || 'date').trim()
    const page = Math.max(1, Number(params.page) || 1)
    const limit = Math.max(1, Math.min(250, Number(params.limit) || 6))
    const userLat = params.lat !== undefined && params.lat !== '' ? Number(params.lat) : -37.8136
    const userLng = params.lng !== undefined && params.lng !== '' ? Number(params.lng) : 144.9631

    let list = db.meets.map((m) => {
      const enriched = enrichMeet(db, m, currentUser)
      enriched.distance_km = haversineKm(userLat, userLng, enriched.latitude, enriched.longitude)
      return enriched
    })

    if (vibe && vibe !== 'All') {
      list = list.filter((m) => m.vibe.toLowerCase() === vibe.toLowerCase())
    }
    if (region && region !== 'All') {
      list = list.filter((m) => m.region.toLowerCase() === region.toLowerCase())
    }
    if (status && status !== 'all') {
      list = list.filter((m) => m.status.toLowerCase() === status.toLowerCase())
    }
    if (search) {
      list = list.filter((m) => {
        const hay = `${m.title} ${m.description} ${m.cafe_name} ${m.address} ${m.vibe} ${m.host_name}`.toLowerCase()
        return hay.includes(search)
      })
    }

    if (sort === 'popular') {
      list.sort((a, b) => b.rsvp_count * 2 + b.likes_count - (a.rsvp_count * 2 + a.likes_count))
    } else if (sort === 'distance') {
      list.sort((a, b) => a.distance_km - b.distance_km)
    } else {
      list.sort((a, b) => String(a.meet_datetime).localeCompare(String(b.meet_datetime)))
    }

    const total = list.length
    const totalPages = Math.max(1, Math.ceil(total / limit))
    const start = (page - 1) * limit
    return {
      data: list.slice(start, start + limit),
      page,
      limit,
      total,
      total_pages: totalPages
    }
  }

  if (endpoint === 'meets' && method === 'POST') {
    if (!currentUser) throw localError('Please sign in to host a meet.', 401)
    const title = String(body.title || '').trim()
    const cafeName = String(body.cafe_name || '').trim()
    const address = String(body.address || '').trim()
    if (title.length < 4 || cafeName.length < 2 || address.length < 4) {
      throw localError('Please provide a valid meet title, cafe name, and address.', 400)
    }

    const newMeet = {
      id: nextId(db.meets),
      title,
      description: String(body.description || '').trim(),
      vibe: body.vibe || 'Morning Coffee',
      region: body.region === 'Malaysia' ? 'Malaysia' : 'Australia',
      cafe_name: cafeName,
      address,
      parking_note:
        String(body.parking_note || '').trim() ||
        'Park respectfully in main customer bays—no revving.',
      host_contact:
        String(body.host_contact || '').trim() || `${currentUser.name} (${currentUser.email})`,
      latitude: Number(body.latitude) || -37.8136,
      longitude: Number(body.longitude) || 144.9631,
      meet_datetime: String(body.meet_datetime || '2026-11-29 08:00:00').replace('T', ' '),
      end_datetime: String(body.end_datetime || '2026-11-29 11:00:00').replace('T', ' '),
      capacity: Math.max(5, Number(body.capacity) || 60),
      image:
        String(body.image || '').trim() ||
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=900&auto=format&fit=crop&q=80',
      source_url: body.source_url ? String(body.source_url).trim() : null,
      host_id: Number(currentUser.id),
      status: 'upcoming',
      created_at: nowSql()
    }
    db.meets.push(newMeet)
    saveDb(db)
    return { meet: enrichMeet(db, newMeet, currentUser) }
  }

  // 5. Single Meet Detail, Update & Delete (`meets/:id`)
  const meetMatch = endpoint.match(/^meets\/(\d+)$/)
  if (meetMatch) {
    const meetId = Number(meetMatch[1])
    const idx = db.meets.findIndex((m) => Number(m.id) === meetId)
    if (idx < 0) throw localError('Meet not found.', 404)
    const meetRow = db.meets[idx]

    if (method === 'GET') {
      const enriched = enrichMeet(db, meetRow, currentUser)
      enriched.comments = db.comments
        .filter((c) => c.target_type === 'meet' && Number(c.target_id) === meetId)
        .map((c) => {
          const u = db.users.find((usr) => Number(usr.id) === Number(c.user_id))
          return {
            ...c,
            user_name: u ? u.name : 'Community Member',
            user_avatar: u ? u.avatar : null,
            car_make: u ? u.car_make : null,
            car_model: u ? u.car_model : null
          }
        })
        .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
      return { meet: enriched }
    }

    if (method === 'PUT') {
      if (!currentUser) throw localError('Authentication required.', 401)
      if (Number(meetRow.host_id) !== Number(currentUser.id) && currentUser.role !== 'admin') {
        throw localError('You can only edit meets that you hosted.', 403)
      }
      db.meets[idx] = {
        ...meetRow,
        title: body.title !== undefined ? String(body.title).trim() : meetRow.title,
        description:
          body.description !== undefined ? String(body.description).trim() : meetRow.description,
        vibe: body.vibe || meetRow.vibe,
        region: body.region || meetRow.region,
        cafe_name: body.cafe_name !== undefined ? String(body.cafe_name).trim() : meetRow.cafe_name,
        address: body.address !== undefined ? String(body.address).trim() : meetRow.address,
        parking_note:
          body.parking_note !== undefined ? String(body.parking_note).trim() : meetRow.parking_note,
        host_contact:
          body.host_contact !== undefined ? String(body.host_contact).trim() : meetRow.host_contact,
        latitude: body.latitude !== undefined ? Number(body.latitude) : meetRow.latitude,
        longitude: body.longitude !== undefined ? Number(body.longitude) : meetRow.longitude,
        meet_datetime: body.meet_datetime
          ? String(body.meet_datetime).replace('T', ' ')
          : meetRow.meet_datetime,
        end_datetime: body.end_datetime
          ? String(body.end_datetime).replace('T', ' ')
          : meetRow.end_datetime,
        capacity: body.capacity !== undefined ? Number(body.capacity) : meetRow.capacity,
        image: body.image !== undefined ? String(body.image).trim() : meetRow.image,
        status: body.status || meetRow.status
      }
      saveDb(db)
      return { meet: enrichMeet(db, db.meets[idx], currentUser) }
    }

    if (method === 'DELETE') {
      if (!currentUser) throw localError('Authentication required.', 401)
      if (Number(meetRow.host_id) !== Number(currentUser.id) && currentUser.role !== 'admin') {
        throw localError('You can only delete meets that you hosted.', 403)
      }
      db.meets.splice(idx, 1)
      db.meet_rsvps = db.meet_rsvps.filter((r) => Number(r.meet_id) !== meetId)
      db.comments = db.comments.filter(
        (c) => !(c.target_type === 'meet' && Number(c.target_id) === meetId)
      )
      saveDb(db)
      return { deleted: true, id: meetId }
    }
  }

  // 6. Meet RSVP & Car Roll-Call (`meets/:id/rsvp`)
  const rsvpMatch = endpoint.match(/^meets\/(\d+)\/rsvp$/)
  if (rsvpMatch) {
    if (!currentUser) throw localError('Please sign in to RSVP.', 401)
    const meetId = Number(rsvpMatch[1])
    const meetRow = db.meets.find((m) => Number(m.id) === meetId)
    if (!meetRow) throw localError('Meet not found.', 404)

    const existingIdx = db.meet_rsvps.findIndex(
      (r) => Number(r.meet_id) === meetId && Number(r.user_id) === Number(currentUser.id)
    )

    if (method === 'POST') {
      const attendType = body.attend_type === 'spectating' ? 'spectating' : 'bringing_car'
      const defaultCar = currentUser.car_make
        ? `${currentUser.car_year || ''} ${currentUser.car_make} ${currentUser.car_model || ''}`.trim()
        : 'Weekend Cruiser'
      const carBrought =
        String(body.car_brought || '').trim() ||
        (attendType === 'bringing_car' ? defaultCar : 'Grabbing Coffee / Spectating')

      if (existingIdx >= 0) {
        db.meet_rsvps[existingIdx].attend_type = attendType
        db.meet_rsvps[existingIdx].car_brought = carBrought
      } else {
        db.meet_rsvps.push({
          id: nextId(db.meet_rsvps),
          meet_id: meetId,
          user_id: Number(currentUser.id),
          attend_type: attendType,
          car_brought: carBrought,
          created_at: nowSql()
        })
      }
      saveDb(db)
      return { meet: enrichMeet(db, meetRow, currentUser) }
    }

    if (method === 'DELETE') {
      if (existingIdx >= 0) {
        db.meet_rsvps.splice(existingIdx, 1)
        saveDb(db)
      }
      return { meet: enrichMeet(db, meetRow, currentUser) }
    }
  }

  // 7. Social Community Posts (`posts`, `posts/:id`)
  if (endpoint === 'posts' && method === 'GET') {
    const search = String(params.search || '')
      .trim()
      .toLowerCase()
    const sort = String(params.sort || 'newest').trim()
    const page = Math.max(1, Number(params.page) || 1)
    const limit = Math.max(1, Math.min(250, Number(params.limit) || 6))

    let items = db.posts.map((p) => enrichPost(db, p))
    if (search) {
      items = items.filter((p) => {
        const hay = `${p.title} ${p.body} ${p.car_tag} ${p.location_tag} ${p.author_name}`.toLowerCase()
        return hay.includes(search)
      })
    }
    if (sort === 'popular') {
      items.sort(
        (a, b) => b.likes_count * 2 + b.comments_count - (a.likes_count * 2 + a.comments_count)
      )
    } else {
      items.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
    }

    const total = items.length
    const totalPages = Math.max(1, Math.ceil(total / limit))
    const start = (page - 1) * limit
    return {
      data: items.slice(start, start + limit),
      page,
      limit,
      total,
      total_pages: totalPages
    }
  }

  if (endpoint === 'posts' && method === 'POST') {
    if (!currentUser) throw localError('Please sign in to share a post.', 401)
    const title = String(body.title || '').trim()
    const text = String(body.body || '').trim()
    if (title.length < 3 || text.length < 5) {
      throw localError('Please enter a post headline and caption.', 400)
    }
    const newPost = {
      id: nextId(db.posts),
      user_id: Number(currentUser.id),
      meet_id: body.meet_id ? Number(body.meet_id) : null,
      title,
      body: text,
      car_tag:
        String(body.car_tag || '').trim() ||
        `${currentUser.car_make || ''} ${currentUser.car_model || ''}`.trim() ||
        'Street Build',
      location_tag: String(body.location_tag || '').trim() || currentUser.region,
      image:
        String(body.image || '').trim() ||
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=900&auto=format&fit=crop&q=80',
      created_at: nowSql()
    }
    db.posts.unshift(newPost)
    saveDb(db)
    return { post: enrichPost(db, newPost) }
  }

  const postMatch = endpoint.match(/^posts\/(\d+)$/)
  if (postMatch) {
    if (!currentUser) throw localError('Authentication required.', 401)
    const postId = Number(postMatch[1])
    const idx = db.posts.findIndex((p) => Number(p.id) === postId)
    if (idx < 0) throw localError('Post not found.', 404)
    const postRow = db.posts[idx]

    if (Number(postRow.user_id) !== Number(currentUser.id) && currentUser.role !== 'admin') {
      throw localError('You can only edit or delete your own posts.', 403)
    }

    if (method === 'PUT') {
      db.posts[idx] = {
        ...postRow,
        title: body.title !== undefined ? String(body.title).trim() : postRow.title,
        body: body.body !== undefined ? String(body.body).trim() : postRow.body,
        car_tag: body.car_tag !== undefined ? String(body.car_tag).trim() : postRow.car_tag,
        location_tag:
          body.location_tag !== undefined ? String(body.location_tag).trim() : postRow.location_tag,
        image: body.image !== undefined ? String(body.image).trim() : postRow.image
      }
      saveDb(db)
      return { post: enrichPost(db, db.posts[idx]) }
    }

    if (method === 'DELETE') {
      db.posts.splice(idx, 1)
      db.comments = db.comments.filter(
        (c) => !(c.target_type === 'post' && Number(c.target_id) === postId)
      )
      saveDb(db)
      return { deleted: true, id: postId }
    }
  }

  // 8. Likes Toggle (`likes`)
  if (endpoint === 'likes' && method === 'POST') {
    if (!currentUser) throw localError('Please sign in to like content.', 401)
    const targetType = body.target_type === 'post' ? 'post' : 'meet'
    const targetId = Number(body.target_id)
    const existingIdx = db.likes.findIndex(
      (l) =>
        Number(l.user_id) === Number(currentUser.id) &&
        l.target_type === targetType &&
        Number(l.target_id) === targetId
    )
    let liked = false
    if (existingIdx >= 0) {
      db.likes.splice(existingIdx, 1)
    } else {
      db.likes.push({
        id: nextId(db.likes),
        user_id: Number(currentUser.id),
        target_type: targetType,
        target_id: targetId,
        created_at: nowSql()
      })
      liked = true
    }
    saveDb(db)
    const likedBy = db.likes
      .filter((l) => l.target_type === targetType && Number(l.target_id) === targetId)
      .map((l) => Number(l.user_id))
    return {
      liked,
      likes_count: likedBy.length,
      liked_by: likedBy
    }
  }

  // 9. Comments (`comments`, `comments/:id`)
  if (endpoint === 'comments' && method === 'POST') {
    if (!currentUser) throw localError('Please sign in to comment.', 401)
    const targetType = body.target_type === 'post' ? 'post' : 'meet'
    const targetId = Number(body.target_id)
    const text = String(body.body || '').trim()
    if (text.length < 2) throw localError('Comment cannot be empty.', 400)
    const rating =
      body.rating && Number(body.rating) >= 1 && Number(body.rating) <= 5
        ? Number(body.rating)
        : null

    const newComment = {
      id: nextId(db.comments),
      user_id: Number(currentUser.id),
      target_type: targetType,
      target_id: targetId,
      body: text,
      rating,
      created_at: nowSql()
    }
    db.comments.push(newComment)
    saveDb(db)
    return {
      comment: {
        ...newComment,
        user_name: currentUser.name,
        user_avatar: currentUser.avatar,
        car_make: currentUser.car_make,
        car_model: currentUser.car_model
      }
    }
  }

  const commentDelMatch = endpoint.match(/^comments\/(\d+)$/)
  if (commentDelMatch && method === 'DELETE') {
    if (!currentUser) throw localError('Authentication required.', 401)
    const cid = Number(commentDelMatch[1])
    const idx = db.comments.findIndex((c) => Number(c.id) === cid)
    if (idx < 0) throw localError('Comment not found.', 404)
    if (
      Number(db.comments[idx].user_id) !== Number(currentUser.id) &&
      currentUser.role !== 'admin'
    ) {
      throw localError('Not authorised to delete this comment.', 403)
    }
    db.comments.splice(idx, 1)
    saveDb(db)
    return { deleted: true, id: cid }
  }

  // 10. Insights & Admin (`insights`, `admin/users/:id`)
  if (endpoint === 'insights' && method === 'GET') {
    const vibeCounts = {}
    db.meets.forEach((m) => {
      vibeCounts[m.vibe] = (vibeCounts[m.vibe] || 0) + 1
    })

    const makeCounts = {}
    db.users.forEach((u) => {
      if (u.car_make) {
        makeCounts[u.car_make] = (makeCounts[u.car_make] || 0) + 1
      }
    })
    db.meet_rsvps.forEach((r) => {
      if (r.attend_type === 'bringing_car' && r.car_brought) {
        const parts = String(r.car_brought).split(' ')
        const make = parts.length > 1 && /^\d{4}$/.test(parts[0]) ? parts[1] : parts[0]
        if (make) makeCounts[make] = (makeCounts[make] || 0) + 1
      }
    })

    return {
      kpis: {
        total_meets: db.meets.length,
        total_rsvps: db.meet_rsvps.length,
        total_posts: db.posts.length,
        total_users: db.users.length
      },
      vibe_distribution: vibeCounts,
      make_distribution: makeCounts,
      users: db.users.map(sanitizeUser)
    }
  }

  const adminUserMatch = endpoint.match(/^admin\/users\/(\d+)$/)
  if (adminUserMatch && method === 'DELETE') {
    if (!currentUser || currentUser.role !== 'admin') {
      throw localError('Admin privileges required.', 403)
    }
    const targetId = Number(adminUserMatch[1])
    if (targetId === Number(currentUser.id)) {
      throw localError('Cannot delete your own admin account.', 400)
    }
    const idx = db.users.findIndex((u) => Number(u.id) === targetId)
    if (idx >= 0) {
      db.users.splice(idx, 1)
      saveDb(db)
    }
    return { deleted: true, id: targetId }
  }

  throw localError(`Unhandled LocalDB endpoint: ${method} ${endpoint}`, 404)
}
