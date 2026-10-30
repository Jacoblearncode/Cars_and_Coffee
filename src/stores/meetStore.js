/**
 * Cars & Coffee — Pinia Meets & Social Community Feed Store
 * Centralizes state for Cars & Coffee meets, Car Roll-Call RSVPs, likes, comments, and social posts.
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '../services/api'

export const useMeetStore = defineStore('meets', () => {
  const meets = ref([])
  const currentMeet = ref(null)
  const pagination = ref({ page: 1, limit: 6, total: 0, total_pages: 1 })

  const posts = ref([])
  const postsPagination = ref({ page: 1, limit: 6, total: 0, total_pages: 1 })

  const loading = ref(false)
  const error = ref(null)

  async function fetchMeets(params = {}) {
    loading.value = true
    error.value = null
    try {
      const res = await api.get('meets', params)
      meets.value = res.data || []
      pagination.value = {
        page: res.page || 1,
        limit: res.limit || 6,
        total: res.total || 0,
        total_pages: res.total_pages || 1
      }
      return res
    } catch (err) {
      error.value = err.message || 'Failed to load meets.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchMeetById(id) {
    loading.value = true
    error.value = null
    try {
      const res = await api.get(`meets/${id}`)
      currentMeet.value = res.meet
      return res.meet
    } catch (err) {
      error.value = err.message || 'Failed to load meet details.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createMeet(payload) {
    const res = await api.post('meets', payload)
    meets.value.unshift(res.meet)
    return res.meet
  }

  async function updateMeet(id, payload) {
    const res = await api.put(`meets/${id}`, payload)
    const idx = meets.value.findIndex((m) => Number(m.id) === Number(id))
    if (idx >= 0) meets.value[idx] = res.meet
    if (currentMeet.value && Number(currentMeet.value.id) === Number(id)) {
      currentMeet.value = { ...currentMeet.value, ...res.meet }
    }
    return res.meet
  }

  async function deleteMeet(id) {
    await api.delete(`meets/${id}`)
    meets.value = meets.value.filter((m) => Number(m.id) !== Number(id))
    if (currentMeet.value && Number(currentMeet.value.id) === Number(id)) {
      currentMeet.value = null
    }
  }

  async function rsvpToMeet(meetId, attendType = 'bringing_car', carBrought = '') {
    const res = await api.post(`meets/${meetId}/rsvp`, {
      attend_type: attendType,
      car_brought: carBrought
    })
    const idx = meets.value.findIndex((m) => Number(m.id) === Number(meetId))
    if (idx >= 0) meets.value[idx] = res.meet
    if (currentMeet.value && Number(currentMeet.value.id) === Number(meetId)) {
      currentMeet.value = { ...currentMeet.value, ...res.meet }
    }
    return res.meet
  }

  async function cancelRsvp(meetId) {
    const res = await api.delete(`meets/${meetId}/rsvp`)
    const idx = meets.value.findIndex((m) => Number(m.id) === Number(meetId))
    if (idx >= 0) meets.value[idx] = res.meet
    if (currentMeet.value && Number(currentMeet.value.id) === Number(meetId)) {
      currentMeet.value = { ...currentMeet.value, ...res.meet }
    }
    return res.meet
  }

  async function toggleLike(targetType, targetId) {
    const res = await api.post('likes', { target_type: targetType, target_id: targetId })
    if (targetType === 'meet') {
      const idx = meets.value.findIndex((m) => Number(m.id) === Number(targetId))
      if (idx >= 0) {
        meets.value[idx].likes_count = res.likes_count
        meets.value[idx].liked_by = res.liked_by
      }
      if (currentMeet.value && Number(currentMeet.value.id) === Number(targetId)) {
        currentMeet.value.likes_count = res.likes_count
        currentMeet.value.liked_by = res.liked_by
      }
    } else if (targetType === 'post') {
      const idx = posts.value.findIndex((p) => Number(p.id) === Number(targetId))
      if (idx >= 0) {
        posts.value[idx].likes_count = res.likes_count
        posts.value[idx].liked_by = res.liked_by
      }
    }
    return res
  }

  async function addComment(targetType, targetId, body, rating = null) {
    const res = await api.post('comments', {
      target_type: targetType,
      target_id: targetId,
      body,
      rating
    })
    if (
      targetType === 'meet' &&
      currentMeet.value &&
      Number(currentMeet.value.id) === Number(targetId)
    ) {
      if (!Array.isArray(currentMeet.value.comments)) currentMeet.value.comments = []
      currentMeet.value.comments.unshift(res.comment)
    } else if (targetType === 'post') {
      const idx = posts.value.findIndex((p) => Number(p.id) === Number(targetId))
      if (idx >= 0) {
        if (!Array.isArray(posts.value[idx].comments)) posts.value[idx].comments = []
        posts.value[idx].comments.push(res.comment)
        posts.value[idx].comments_count = posts.value[idx].comments.length
      }
    }
    return res.comment
  }

  async function deleteComment(commentId, targetType = 'meet', targetId = null) {
    await api.delete(`comments/${commentId}`)
    if (targetType === 'meet' && currentMeet.value && Array.isArray(currentMeet.value.comments)) {
      currentMeet.value.comments = currentMeet.value.comments.filter(
        (c) => Number(c.id) !== Number(commentId)
      )
    } else if (targetType === 'post' && targetId) {
      const idx = posts.value.findIndex((p) => Number(p.id) === Number(targetId))
      if (idx >= 0 && Array.isArray(posts.value[idx].comments)) {
        posts.value[idx].comments = posts.value[idx].comments.filter(
          (c) => Number(c.id) !== Number(commentId)
        )
        posts.value[idx].comments_count = posts.value[idx].comments.length
      }
    }
  }

  async function fetchPosts(params = {}) {
    loading.value = true
    try {
      const res = await api.get('posts', params)
      posts.value = res.data || []
      postsPagination.value = {
        page: res.page || 1,
        limit: res.limit || 6,
        total: res.total || 0,
        total_pages: res.total_pages || 1
      }
      return res
    } finally {
      loading.value = false
    }
  }

  async function createPost(payload) {
    const res = await api.post('posts', payload)
    posts.value.unshift(res.post)
    return res.post
  }

  async function updatePost(id, payload) {
    const res = await api.put(`posts/${id}`, payload)
    const idx = posts.value.findIndex((p) => Number(p.id) === Number(id))
    if (idx >= 0) posts.value[idx] = res.post
    return res.post
  }

  async function deletePost(id) {
    await api.delete(`posts/${id}`)
    posts.value = posts.value.filter((p) => Number(p.id) !== Number(id))
  }

  return {
    meets,
    currentMeet,
    pagination,
    posts,
    postsPagination,
    loading,
    error,
    fetchMeets,
    fetchMeetById,
    createMeet,
    updateMeet,
    deleteMeet,
    rsvpToMeet,
    cancelRsvp,
    toggleLike,
    addComment,
    deleteComment,
    fetchPosts,
    createPost,
    updatePost,
    deletePost
  }
})
