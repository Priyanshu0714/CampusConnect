// ── Relative Time Formatter ────────────────────────────────────────────────
function formatRelativeTime(timestamp) {
  if (!timestamp) return "Recently";
  const now = Date.now();
  const diffMs = now - new Date(timestamp).getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(timestamp).toLocaleDateString([], { month: "short", day: "numeric" });
}

function updateAllTimestamps() {
  document.querySelectorAll(".post-time").forEach((el) => {
    const ts = el.dataset.ts;
    if (ts) el.textContent = formatRelativeTime(parseInt(ts) || ts);
  });
}
updateAllTimestamps();

// ── Toast Helper ────────────────────────────────────────────────────────────
function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.remove("opacity-0");
  toast.classList.add("opacity-100");
  setTimeout(() => {
    toast.classList.remove("opacity-100");
    toast.classList.add("opacity-0");
  }, 2000);
}

// ── Navigation ──────────────────────────────────────────────────────────────
const profileSection = document.getElementById("profile_section");
if (profileSection) {
  profileSection.addEventListener("click", () => {
    window.location.href = "/profile";
  });
}

const homeBtn = document.getElementById("home");
if (homeBtn) {
  homeBtn.addEventListener("click", () => {
    window.location.href = "/";
  });
}

const messageBtn = document.getElementById("messagebutton");
if (messageBtn) {
  messageBtn.addEventListener("click", () => {
    window.location.href = "/message";
  });
}

const anyoIcon = document.getElementById("anyonomousIcon");
if (anyoIcon) {
  anyoIcon.addEventListener("click", () => {
    window.location.href = "/anyonomousChat";
  });
}

// ── Search Overlay ──────────────────────────────────────────────────────────
const searchBtn = document.getElementById("searchbutton");
const searchPage = document.getElementById("searchpage");
const closeSearch = document.getElementById("closesearchbar");
const searchInput = document.getElementById("searchuserid");
const searchDisplay = document.getElementById("searchuserdisplay");

if (searchBtn && searchPage) {
  searchBtn.addEventListener("click", () => {
    searchPage.classList.remove("hidden");
    searchPage.classList.add("flex");
    if (searchInput) searchInput.focus();
  });
}

if (closeSearch && searchPage) {
  closeSearch.addEventListener("click", () => {
    searchPage.classList.add("hidden");
    searchPage.classList.remove("flex");
  });
}

let searchDebounce = null;
if (searchInput && searchDisplay) {
  searchInput.addEventListener("input", () => {
    clearTimeout(searchDebounce);
    const query = searchInput.value.trim();
    if (!query) {
      searchDisplay.innerHTML = "";
      return;
    }
    searchDebounce = setTimeout(async () => {
      try {
        const res = await fetch("/profile/searchuser", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ searchkeyword: query }),
        });
        const { data } = await res.json();
        searchDisplay.innerHTML = "";
        if (data && data.length > 0) {
          data.forEach((user) => {
            const item = document.createElement("a");
            item.href = `/profile/userprofile/${user._id}`;
            item.className = "flex items-center gap-3 p-2.5 hover:bg-gray-50 rounded-xl transition-colors";
            item.innerHTML = `
              <img src="${user.profileimg}" class="w-10 h-10 rounded-full object-cover ring-1 ring-[#bee84a]">
              <div class="flex flex-col">
                <span class="text-sm font-bold text-gray-900">${user.name}</span>
                <span class="text-xs text-gray-400">@${user.username}</span>
              </div>
            `;
            searchDisplay.appendChild(item);
          });
        } else {
          searchDisplay.innerHTML = '<div class="p-4 text-xs text-gray-400 text-center">No students found</div>';
        }
      } catch (err) {
        console.error("Search error:", err);
      }
    }, 200);
  });
}

// ── Post Upload Modal ───────────────────────────────────────────────────────
const uploadIcon = document.getElementById("uploadPostIcon");
const postUploadModal = document.getElementById("postupload");
const postDivClose = document.getElementById("postdivClose");

if (uploadIcon && postUploadModal) {
  uploadIcon.addEventListener("click", () => {
    postUploadModal.classList.remove("hidden");
    postUploadModal.classList.add("flex");
  });
}

if (postDivClose && postUploadModal) {
  postDivClose.addEventListener("click", () => {
    postUploadModal.classList.add("hidden");
    postUploadModal.classList.remove("flex");
  });
}

// ── Story Upload Modal ──────────────────────────────────────────────────────
const storyUploadBtn = document.getElementById("storiesUpload");
const storyUploadModal = document.getElementById("storyupload");
const storyDivClose = document.getElementById("storydivClose");

if (storyUploadBtn && storyUploadModal) {
  storyUploadBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    storyUploadModal.classList.remove("hidden");
    storyUploadModal.classList.add("flex");
  });
}

if (storyDivClose && storyUploadModal) {
  storyDivClose.addEventListener("click", () => {
    storyUploadModal.classList.add("hidden");
    storyUploadModal.classList.remove("flex");
  });
}

// ── Story View ──────────────────────────────────────────────────────────────
const storyViewModal = document.getElementById("storyView");
const closeStoryBtn = document.getElementById("CloseStory");
const storyImg = document.getElementById("storyImg");
const yourStoryBtn = document.getElementById("storiesView");

if (yourStoryBtn && storyViewModal) {
  yourStoryBtn.addEventListener("click", async () => {
    try {
      const res = await fetch("/stories", { method: "POST" });
      const data = await res.json();
      if (data && data.StoryLink) {
        storyImg.src = data.StoryLink;
        document.getElementById("storyOwnerName").textContent = "Your Story";
        storyViewModal.classList.remove("hidden");
        storyViewModal.classList.add("flex");
      } else {
        // Prompt to upload if no story
        storyUploadModal.classList.remove("hidden");
        storyUploadModal.classList.add("flex");
      }
    } catch {
      storyUploadModal.classList.remove("hidden");
      storyUploadModal.classList.add("flex");
    }
  });
}

document.querySelectorAll(".stories").forEach((item) => {
  item.addEventListener("click", () => {
    const link = item.id;
    if (link && storyViewModal) {
      storyImg.src = link;
      document.getElementById("storyOwnerName").textContent = "Story";
      storyViewModal.classList.remove("hidden");
      storyViewModal.classList.add("flex");
    }
  });
});

if (closeStoryBtn && storyViewModal) {
  closeStoryBtn.addEventListener("click", () => {
    storyViewModal.classList.add("hidden");
    storyViewModal.classList.remove("flex");
  });
}

// ── Like Toggle ─────────────────────────────────────────────────────────────
document.addEventListener("click", async (e) => {
  const likeBtn = e.target.closest(".userlikebutton");
  if (!likeBtn) return;

  const svg = likeBtn.querySelector("svg");
  const countEl = likeBtn.querySelector(".like-count");
  const postId = svg.id;
  if (!postId) return;

  let currentCount = parseInt(countEl.textContent) || 0;

  try {
    const res = await fetch("/like/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: postId }),
    });
    const data = await res.json();

    if (data.success) {
      // Liked
      svg.setAttribute("fill", "#ef4444");
      svg.querySelector("path").setAttribute("stroke", "#ef4444");
      countEl.textContent = currentCount + 1;
    } else {
      // Unliked
      svg.setAttribute("fill", "none");
      svg.querySelector("path").setAttribute("stroke", "#374151");
      countEl.textContent = Math.max(0, currentCount - 1);
    }
  } catch (err) {
    console.error("Like toggle error:", err);
  }
});

// ── Comment Section Toggle & Submit ─────────────────────────────────────────
document.addEventListener("click", async (e) => {
  const commentToggleBtn = e.target.closest(".comments");
  if (!commentToggleBtn) return;

  const postCard = commentToggleBtn.closest(".post-card");
  const commentSection = postCard.querySelector(".comment-section");
  if (!commentSection) return;

  commentSection.classList.toggle("open");

  if (commentSection.classList.contains("open")) {
    const postId = postCard.dataset.postid;
    const listEl = commentSection.querySelector(".comment-list");
    await loadComments(postId, listEl);
  }
});

async function loadComments(postId, listEl) {
  try {
    const res = await fetch("/comment/getdata", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postid: postId }),
    });
    const data = await res.json();
    listEl.innerHTML = "";

    if (data.success && data.postComments && data.postComments.length > 0) {
      data.postComments.forEach((c) => {
        const item = document.createElement("div");
        item.className = "p-2 rounded-xl bg-gray-50 border border-gray-100 text-xs flex flex-col gap-0.5";
        item.innerHTML = `
          <div class="flex items-center justify-between">
            <span class="font-bold text-gray-800">@${escapeHtml(c.userName)}</span>
            <span class="text-[10px] text-gray-400">${formatRelativeTime(c.timestamp)}</span>
          </div>
          <span class="text-gray-700 leading-relaxed">${escapeHtml(c.comment)}</span>
        `;
        listEl.appendChild(item);
      });
    } else {
      listEl.innerHTML = '<div class="text-xs text-gray-400 text-center py-2">No comments yet. Start the conversation!</div>';
    }
  } catch (err) {
    console.error("Load comments error:", err);
    listEl.innerHTML = '<div class="text-xs text-rose-500 text-center py-1">Could not load comments</div>';
  }
}

// Submit comment
document.addEventListener("click", async (e) => {
  const submitBtn = e.target.closest(".submitComment");
  if (!submitBtn) return;

  const postId = submitBtn.dataset.postid;
  const section = document.getElementById(`commentSection-${postId}`);
  const input = section.querySelector(".commentInput");
  const text = input.value.trim();
  if (!text) return;

  input.value = "";

  try {
    const res = await fetch("/comment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postid: postId, message: text }),
    });
    const data = await res.json();
    if (data.success) {
      input.value = "";
      const listEl = section.querySelector(".comment-list");
      const emptyNotice = listEl.querySelector(".text-gray-400");
      if (emptyNotice) emptyNotice.remove();

      const item = document.createElement("div");
      item.className = "p-2 rounded-xl bg-gray-50 border border-gray-100 text-xs flex flex-col gap-0.5";
      item.innerHTML = `
        <div class="flex items-center justify-between">
          <span class="font-bold text-gray-800">@${escapeHtml(data.comment ? data.comment.userName : "You")}</span>
          <span class="text-[10px] text-gray-400">Just now</span>
        </div>
        <span class="text-gray-700 leading-relaxed">${escapeHtml(text)}</span>
      `;
      listEl.appendChild(item);

      // Update count on post
      const countEl = section.closest(".post-card").querySelector(".comment-count");
      if (countEl) countEl.textContent = (parseInt(countEl.textContent) || 0) + 1;
    } else {
      showToast(data.message || "Failed to post comment");
    }
  } catch (err) {
    console.error("Comment submit error:", err);
    showToast("Network error while commenting");
  }
});

// Submit comment on Enter key
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && e.target.classList.contains("commentInput")) {
    const postId = e.target.dataset.postid;
    const submitBtn = document.querySelector(`.submitComment[data-postid="${postId}"]`);
    if (submitBtn) submitBtn.click();
  }
});

// ── Post Options Menu (Copy Link, Save, Delete) ─────────────────────────────
document.addEventListener("click", (e) => {
  const optionsBtn = e.target.closest(".post-options-btn");
  if (optionsBtn) {
    const menu = optionsBtn.querySelector(".post-options-menu");
    // Close other open menus
    document.querySelectorAll(".post-options-menu").forEach((m) => {
      if (m !== menu) m.classList.add("hidden");
    });
    menu.classList.toggle("hidden");
    return;
  }

  // Close menus on outside click
  if (!e.target.closest(".post-options-menu")) {
    document.querySelectorAll(".post-options-menu").forEach((m) => m.classList.add("hidden"));
  }
});

// Copy link
document.addEventListener("click", (e) => {
  const copyBtn = e.target.closest(".copy-link-btn");
  if (!copyBtn) return;
  const postCard = copyBtn.closest(".post-card");
  const postId = postCard.dataset.postid;
  const url = `${window.location.origin}/post/${postId}`;
  navigator.clipboard.writeText(url).then(() => {
    showToast("Post link copied to clipboard! 📋");
  });
});

// Save post removed as requested

// Delete post
document.addEventListener("click", async (e) => {
  const delBtn = e.target.closest(".delete-post-btn");
  if (!delBtn) return;
  if (!confirm("Are you sure you want to delete this post? This cannot be undone.")) return;
  const postId = delBtn.dataset.postid;
  try {
    const res = await fetch(`/post/delete/${postId}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      showToast("Post deleted");
      const postCard = delBtn.closest(".post-card");
      if (postCard) {
        postCard.style.opacity = "0";
        postCard.style.transform = "scale(0.95)";
        postCard.style.transition = "all 0.25s ease";
        setTimeout(() => postCard.remove(), 250);
      }
    } else {
      showToast(data.message || "Could not delete post");
    }
  } catch (err) {
    console.error("Delete error:", err);
    showToast("Network error while deleting");
  }
});

// ── Infinite Scroll on Feed ─────────────────────────────────────────────────
const feedContainer = document.getElementById("feedContainer");
const loadMore = document.getElementById("loadMore");
let isLoadingMore = false;

if (feedContainer && loadMore) {
  feedContainer.addEventListener("scroll", async () => {
    if (isLoadingMore) return;
    const scrollTop = feedContainer.scrollTop;
    const scrollHeight = feedContainer.scrollHeight;
    const clientHeight = feedContainer.clientHeight;

    if (scrollTop + clientHeight >= scrollHeight - 150) {
      const nextPage = loadMore.dataset.page;
      if (!nextPage) return;

      isLoadingMore = true;
      try {
        const res = await fetch(`/api/posts?page=${nextPage}`);
        const data = await res.json();
        if (data.success && data.posts && data.posts.length > 0) {
          renderMorePosts(data);
          if (data.hasMore) {
            loadMore.dataset.page = parseInt(nextPage) + 1;
          } else {
            loadMore.remove();
          }
        } else {
          loadMore.remove();
        }
      } catch (err) {
        console.error("Infinite scroll error:", err);
      } finally {
        isLoadingMore = false;
      }
    }
  });
}

function renderMorePosts(data) {
  data.posts.forEach((element, index) => {
    const owner = data.postOwners[index] || { name: element.postOwner, username: element.postOwner, profileimg: "/images/profileicon.svg" };
    const likes = data.TotalLikes[index] || 0;
    const isLiked = data.likedByUser[index] === 1;

    const card = document.createElement("div");
    card.className = "post-card w-full h-auto border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm mt-3";
    card.dataset.postid = element._id;

    card.innerHTML = `
      <div class="h-16 w-full flex items-center flex-row px-3 gap-3">
        <a href="/profile/userprofile/${owner._id || ''}">
          <div class="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full ring-2 ring-[#bee84a]">
            <img loading="lazy" class="h-full w-full object-cover" src="${owner.profileimg}" alt="${owner.name}">
          </div>
        </a>
        <div class="flex-1">
          <a href="/profile/userprofile/${owner._id || ''}" class="font-semibold text-sm hover:underline">${owner.name}</a>
          <div class="flex items-center gap-1 text-[11px] text-gray-400">
            <span>@${owner.username}</span>
            <span>·</span>
            <span class="post-time">${formatRelativeTime(element.timestamp)}</span>
          </div>
        </div>
      </div>
      <div class="w-full bg-gray-50 overflow-hidden">
        <img loading="lazy" class="w-full h-auto" src="${element.postURL}" alt="Post image">
      </div>
      <div class="px-3 py-2 flex items-center gap-4">
        <button class="userlikebutton flex items-center gap-1.5 hover:opacity-70 transition-opacity">
          <svg id="${element._id}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="${isLiked ? '#ef4444' : 'none'}">
            <path d="M19.4626 3.99415C16.7809 2.34923 14.4404 3.01211 13.0344 4.06801C12.4578 4.50096 12.1696 4.71743 12 4.71743C11.8304 4.71743 11.5422 4.50096 10.9656 4.06801C9.55962 3.01211 7.21909 2.34923 4.53744 3.99415C1.01807 6.15294 0.221721 13.2749 8.33953 19.2834C9.88572 20.4278 10.6588 21 12 21C13.3412 21 14.1143 20.4278 15.6605 19.2834C23.7783 13.2749 22.9819 6.15294 19.4626 3.99415Z" stroke="${isLiked ? '#ef4444' : '#374151'}" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <span class="text-sm font-medium like-count">${likes}</span>
        </button>
        <button class="comments flex items-center gap-1.5 hover:opacity-70 transition-opacity">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none"><path d="M8 13.5H16M8 8.5H12" stroke="#374151" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.09881 19C4.7987 18.8721 3.82475 18.4816 3.17157 17.8284C2 16.6569 2 14.7712 2 11V10.5C2 6.72876 2 4.84315 3.17157 3.67157C4.34315 2.5 6.22876 2.5 10 2.5H14C17.7712 2.5 19.6569 2.5 20.8284 3.67157C22 4.84315 22 6.72876 22 10.5V11C22 14.7712 22 16.6569 20.8284 17.8284C19.6569 19 17.7712 19 14 19C13.4395 19.0125 12.9931 19.0551 12.5546 19.155C11.3562 19.4309 10.2465 20.0441 9.14987 20.5789C7.58729 21.3408 6.806 21.7218 6.31569 21.3651C5.37769 20.6665 6.29454 18.5019 6.5 17.5" stroke="#374151" stroke-width="1.5" stroke-linecap="round"/></svg>
          <span class="text-sm font-medium comment-count">${element.Comment || 0}</span>
        </button>
      </div>
      ${element.caption ? `<div class="px-3 pb-1 text-sm"><span class="font-semibold">${owner.username}</span> <span class="text-gray-700">${escapeHtml(element.caption)}</span></div>` : ''}
      <div class="comment-section flex-col border-t border-gray-100 px-3 pb-3 pt-2" id="commentSection-${element._id}">
        <div class="comment-list space-y-2 max-h-40 overflow-y-scroll scrollbar-hide mb-2" id="commentList-${element._id}">
          <div class="text-xs text-gray-400 text-center">Loading comments...</div>
        </div>
        <div class="flex items-center gap-2 mt-1">
          <input class="commentInput flex-1 h-9 px-3 rounded-full bg-gray-100 text-sm outline-none border-none" placeholder="Add a comment..." data-postid="${element._id}">
          <button class="submitComment h-9 w-9 bg-[#bee84a] rounded-full flex items-center justify-center flex-shrink-0" data-postid="${element._id}">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M22.3886 3.50934C22.9207 2.01947 21.4821 0.58092 19.9922 1.11301L2.24451 7.45149C0.477797 8.08246 0.630218 10.6298 2.45959 11.0455L9.59327 12.648L13.3909 8.73607C13.7756 8.3398 14.4087 8.33041 14.8049 8.7151C15.2012 9.09979 15.2106 9.73289 14.8259 10.1292L10.9106 14.1623L12.456 21.042C12.8718 22.8714 15.4191 23.0238 16.0501 21.2571L22.3886 3.50934Z" fill="#000"/></svg>
          </button>
        </div>
      </div>
    `;

    loadMore.parentNode.insertBefore(card, loadMore);
  });
}

function escapeHtml(str) {
  if (!str) return "";
  const d = document.createElement("div");
  d.innerText = str;
  return d.innerHTML;
}
