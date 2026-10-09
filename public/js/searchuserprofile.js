const followBtn = document.getElementById("followButton");
const followersCount = document.getElementById("followersCount");

if (followBtn) {
  followBtn.addEventListener("click", async () => {
    const userid = followBtn.getAttribute("data-userid");
    try {
      const response = await fetch("/profile/followuser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userid }),
      });
      const data = await response.json();
      if (data.success) {
        let current = parseInt(followersCount.textContent) || 0;
        if (data.following) {
          followBtn.className = "px-6 py-2 rounded-full font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 bg-black text-white";
          followBtn.innerHTML = "<span>Following ✓</span>";
          followersCount.textContent = current + 1;
        } else {
          followBtn.className = "px-6 py-2 rounded-full font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 bg-gradient-to-r from-[#f4ff26] to-[#bee84a] text-gray-900 hover:opacity-95";
          followBtn.innerHTML = "<span>Follow</span>";
          followersCount.textContent = Math.max(0, current - 1);
        }
      }
    } catch (err) {
      console.error("Follow error:", err);
    }
  });
}