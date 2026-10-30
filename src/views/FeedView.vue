<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useMeetStore } from '../stores/meetStore'
import { useAuthStore } from '../stores/authStore'
import { useToast } from '../composables/useToast'
import PaginationBar from '../components/PaginationBar.vue'

const router = useRouter()
const meetStore = useMeetStore()
const authStore = useAuthStore()
const { showToast } = useToast()

const searchQuery = ref('')
const sortBy = ref('newest')
const currentPage = ref(1)

const showComposer = ref(false)
const editingPostId = ref(null)

const postForm = ref({
  title: '',
  body: '',
  car_tag: authStore.userGarageCar !== 'No Car Set' ? authStore.userGarageCar : '',
  location_tag: authStore.user?.region === 'Malaysia' ? 'Kuching / KL' : 'Melbourne, VIC',
  meet_id: '',
  image:
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=900&auto=format&fit=crop&q=80'
})

const commentInputs = ref({})

async function loadFeed() {
  await meetStore.fetchPosts({
    search: searchQuery.value,
    sort: sortBy.value,
    page: currentPage.value,
    limit: 8
  })
}

function openCreateComposer() {
  if (!authStore.isAuthenticated) {
    showToast('Sign in to share a spotting photo or build update.', 'warning')
    router.push('/login')
    return
  }
  editingPostId.value = null
  postForm.value = {
    title: '',
    body: '',
    car_tag: authStore.userGarageCar !== 'No Car Set' ? authStore.userGarageCar : 'Weekend Cruiser',
    location_tag: authStore.user?.region === 'Malaysia' ? 'Kuching, Sarawak' : 'Melbourne, VIC',
    meet_id: '',
    image:
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=900&auto=format&fit=crop&q=80'
  }
  showComposer.value = true
}

function openEditComposer(post) {
  editingPostId.value = post.id
  postForm.value = {
    title: post.title,
    body: post.body,
    car_tag: post.car_tag,
    location_tag: post.location_tag,
    meet_id: post.meet_id || '',
    image: post.image
  }
  showComposer.value = true
}

async function handleSavePost() {
  try {
    if (editingPostId.value) {
      await meetStore.updatePost(editingPostId.value, postForm.value)
      showToast('Post updated!')
    } else {
      await meetStore.createPost(postForm.value)
      showToast('Posted to the Community Spotting Feed!')
    }
    showComposer.value = false
    editingPostId.value = null
    loadFeed()
  } catch (err) {
    showToast(err.message || 'Could not save post.', 'danger')
  }
}

async function handleDeletePost(postId) {
  await meetStore.deletePost(postId)
  showToast('Post deleted.')
}

async function handleLikePost(post) {
  if (!authStore.isAuthenticated) {
    showToast('Sign in to like community posts.', 'warning')
    router.push('/login')
    return
  }
  await meetStore.toggleLike('post', post.id)
}

async function handleAddPostComment(postId) {
  const text = (commentInputs.value[postId] || '').trim()
  if (!text) return
  await meetStore.addComment('post', postId, text)
  commentInputs.value[postId] = ''
  showToast('Comment added!')
}

function canEditPost(post) {
  if (!authStore.isAuthenticated) return false
  return Number(post.user_id) === Number(authStore.user.id) || authStore.isAdmin
}

watch(sortBy, () => {
  currentPage.value = 1
  loadFeed()
})

onMounted(async () => {
  await loadFeed()
  if (meetStore.meets.length === 0) {
    await meetStore.fetchMeets({ limit: 50 })
  }
})
</script>

<template>
  <div class="container">
    <div class="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
      <div>
        <div class="cc-bracket-label">[ 03 // SOCIAL COMMUNITY WALL &amp; BUILD LOG ]</div>
        <h1 class="h2 fw-bold mb-1">
          Car Spotting &amp; Build Feed ({{ meetStore.postsPagination.total }} Snaps)
        </h1>
        <p class="text-secondary small mb-0">
          Share morning coffee snaps, wheel fitment updates, and spotted classics from recent meets.
        </p>
      </div>

      <button type="button" class="btn btn-cc-primary cc-pill-btn" @click="openCreateComposer">
        <i class="bi bi-camera-fill me-1"></i>Share a Spot / Build Post
      </button>
    </div>

    <!-- Collapsible Post Composer (Create / Edit) -->
    <section v-if="showComposer" class="cc-tile mb-4 border-warning">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <div>
          <span class="cc-bracket-label mb-1">[ STUDIO // NEW ENTRY ]</span>
          <h2 class="h5 fw-bold mb-0">
            {{ editingPostId ? 'Edit Community Post' : 'Create Community Spotting Post' }}
          </h2>
        </div>
        <button type="button" class="btn btn-sm btn-cc-outline cc-pill-btn" @click="showComposer = false">
          Close
        </button>
      </div>

      <form @submit.prevent="handleSavePost">
        <div class="row g-3">
          <div class="col-md-6 field">
            <label for="post-title" class="form-label small fw-semibold">Headline *</label>
            <input
              id="post-title"
              v-model="postForm.title"
              type="text"
              class="form-control"
              required
              minlength="3"
              placeholder="e.g. Spotted this clean R32 GT-R at Port Melbourne Pour-Over"
            />
            <div class="error-msg">Please enter a headline (at least 3 characters).</div>
          </div>

          <div class="col-md-3 field">
            <label for="post-car" class="form-label small fw-semibold">Car Make / Build Tag *</label>
            <input
              id="post-car"
              v-model="postForm.car_tag"
              type="text"
              class="form-control"
              required
              placeholder="e.g. Porsche 911 / Toyota GR86"
            />
          </div>

          <div class="col-md-3 field">
            <label for="post-loc" class="form-label small fw-semibold">Location / Cafe Tag *</label>
            <input
              id="post-loc"
              v-model="postForm.location_tag"
              type="text"
              class="form-control"
              required
              placeholder="e.g. St Kilda / Kuching"
            />
          </div>

          <div class="col-md-6 field">
            <label for="post-image" class="form-label small fw-semibold">Photo URL</label>
            <input
              id="post-image"
              v-model="postForm.image"
              type="url"
              class="form-control"
              placeholder="https://images.unsplash.com/..."
            />
          </div>

          <div class="col-md-6 field">
            <label for="post-meet" class="form-label small fw-semibold">Link to a Meet (Optional)</label>
            <select id="post-meet" v-model="postForm.meet_id" class="form-select">
              <option value="">-- General Community Post --</option>
              <option v-for="m in meetStore.meets" :key="m.id" :value="m.id">
                {{ m.title }} ({{ m.cafe_name }})
              </option>
            </select>
          </div>

          <div class="col-12 field">
            <label for="post-body" class="form-label small fw-semibold">Caption / Story *</label>
            <textarea
              id="post-body"
              v-model="postForm.body"
              rows="3"
              class="form-control"
              required
              minlength="5"
              placeholder="Tell the story behind the shot, the coffee order, or your latest mod..."
            ></textarea>
            <div class="error-msg">Please enter a caption (at least 5 characters).</div>
          </div>
        </div>

        <div class="d-flex justify-content-end gap-2 mt-2">
          <button type="button" class="btn btn-sm btn-cc-outline cc-pill-btn" @click="showComposer = false">
            Cancel
          </button>
          <button type="submit" class="btn btn-sm btn-cc-primary cc-pill-btn px-4">
            {{ editingPostId ? 'Update Post' : 'Publish Post' }}
          </button>
        </div>
      </form>
    </section>

    <!-- Search & Sort Bar -->
    <section class="cc-tile p-3 mb-4" aria-label="Search and sort community posts">
      <div class="row g-2 align-items-center">
        <div class="col-md-8">
          <label for="feed-search" class="visually-hidden">Search posts</label>
          <div class="input-group input-group-sm">
            <span class="input-group-text"><i class="bi bi-search" style="color: var(--cc-accent)"></i></span>
            <input
              id="feed-search"
              v-model="searchQuery"
              type="search"
              class="form-control"
              placeholder="Search 36+ snaps by car model, member, location, or keyword..."
              @input="
                () => {
                  currentPage = 1
                  loadFeed()
                }
              "
            />
          </div>
        </div>
        <div class="col-md-4 d-flex align-items-center gap-2">
          <label for="feed-sort" class="small text-secondary text-nowrap mb-0">Sort:</label>
          <select id="feed-sort" v-model="sortBy" class="form-select form-select-sm rounded-pill">
            <option value="newest">Newest Snaps First</option>
            <option value="popular">Most Liked &amp; Discussed</option>
          </select>
        </div>
      </div>
    </section>

    <!-- Posts Grid -->
    <div class="row g-4">
      <div v-for="post in meetStore.posts" :key="post.id" class="col-md-6">
        <article class="cc-tile p-0 h-100 d-flex flex-column overflow-hidden">
          <div class="position-relative" style="height: 240px">
            <img
              :src="post.image"
              :alt="post.title"
              class="w-100 h-100"
              style="object-fit: cover"
              loading="lazy"
            />
            <div class="position-absolute top-0 start-0 p-3 d-flex flex-wrap gap-1">
              <span class="badge text-bg-dark bg-opacity-75 font-mono">
                <i class="bi bi-car-front text-warning me-1"></i>{{ post.car_tag }}
              </span>
              <span class="badge text-bg-secondary bg-opacity-75 font-mono">
                <i class="bi bi-geo-alt me-1"></i>{{ post.location_tag }}
              </span>
            </div>
          </div>

          <div class="p-3 p-md-4 d-flex flex-column flex-grow-1">
            <div class="d-flex justify-content-between align-items-center small text-secondary mb-2">
              <span>
                Posted by <strong>{{ post.author_name }}</strong> &middot;
                <span class="font-mono">{{ post.created_at }}</span>
              </span>
              <div v-if="canEditPost(post)" class="d-flex gap-2">
                <button
                  type="button"
                  class="btn btn-sm btn-link text-warning p-0"
                  aria-label="Edit post"
                  @click="openEditComposer(post)"
                >
                  <i class="bi bi-pencil"></i>
                </button>
                <button
                  type="button"
                  class="btn btn-sm btn-link text-danger p-0"
                  aria-label="Delete post"
                  @click="handleDeletePost(post.id)"
                >
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>

            <h2 class="h5 fw-bold mb-2">{{ post.title }}</h2>
            <p class="small text-secondary mb-3">{{ post.body }}</p>

            <div class="d-flex justify-content-between align-items-center pt-2 border-top mb-3">
              <button
                type="button"
                class="btn btn-sm cc-pill-btn"
                :class="
                  authStore.user && post.liked_by?.includes(Number(authStore.user.id))
                    ? 'btn-danger'
                    : 'btn-cc-outline'
                "
                @click="handleLikePost(post)"
              >
                <i class="bi bi-heart-fill me-1"></i>{{ post.likes_count || 0 }} Likes
              </button>

              <router-link
                v-if="post.meet_id"
                :to="`/meets/${post.meet_id}`"
                class="small text-warning text-decoration-none fw-semibold"
              >
                <i class="bi bi-calendar2-event me-1"></i>View Linked Meet &rarr;
              </router-link>
            </div>

            <!-- Inline Comments -->
            <div class="cc-panel p-2 px-3 mt-auto">
              <div v-if="post.comments && post.comments.length" class="mb-2">
                <div
                  v-for="c in post.comments"
                  :key="c.id"
                  class="small py-1 border-bottom border-secondary border-opacity-10"
                >
                  <strong>{{ c.user_name }}:</strong> {{ c.body }}
                </div>
              </div>

              <form
                v-if="authStore.isAuthenticated"
                class="input-group input-group-sm"
                @submit.prevent="handleAddPostComment(post.id)"
              >
                <input
                  v-model="commentInputs[post.id]"
                  type="text"
                  class="form-control"
                  placeholder="Write a comment..."
                  aria-label="Write a comment"
                />
                <button type="submit" class="btn btn-cc-primary">Send</button>
              </form>
            </div>
          </div>
        </article>
      </div>
    </div>

    <PaginationBar
      :page="meetStore.postsPagination.page"
      :total-pages="meetStore.postsPagination.total_pages"
      :total="meetStore.postsPagination.total"
      @change="
        (p) => {
          currentPage = p
          loadFeed()
        }
      "
    />
  </div>
</template>
