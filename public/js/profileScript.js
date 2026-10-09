// Edit Profile Modal
const editModal = document.getElementById("editprofile");
const editBtn = document.getElementById("edit");
const closeEditBtn = document.getElementById("closeEdit");

if (editBtn) {
  editBtn.addEventListener("click", () => {
    editModal.classList.remove("hidden");
    editModal.classList.add("flex");
  });
}

if (closeEditBtn) {
  closeEditBtn.addEventListener("click", () => {
    editModal.classList.add("hidden");
    editModal.classList.remove("flex");
  });
}

// Save Profile
const saveBtn = document.getElementById("saveContinue");
if (saveBtn) {
  saveBtn.addEventListener("click", async () => {
    const newname = document.getElementById("newname").value.trim();
    const newbio = document.getElementById("newbio").value.trim();
    const college = document.getElementById("college").value.trim();
    const branch = document.getElementById("branch").value.trim();
    const year = document.getElementById("year").value.trim();
    const linkedin = document.getElementById("linkedin").value.trim();
    const github = document.getElementById("github").value.trim();

    saveBtn.textContent = "Saving...";
    saveBtn.style.opacity = "0.7";

    try {
      const request = await fetch("/profile/editprofile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newname,
          newbio,
          college,
          branch,
          year,
          linkedin,
          github,
        }),
      });
      const response = await request.json();
      if (response.success) {
        window.location.reload();
      } else {
        alert("Could not update profile. Please try again.");
        saveBtn.textContent = "Save Changes";
        saveBtn.style.opacity = "1";
      }
    } catch (err) {
      console.error(err);
      alert("Network error.");
      saveBtn.textContent = "Save Changes";
      saveBtn.style.opacity = "1";
    }
  });
}

// Profile Photo Modal
const imageModal = document.getElementById("editImage");
const profileImgBtn = document.getElementById("userprofileImage");
const editImageClose = document.getElementById("editImageClose");

if (profileImgBtn) {
  profileImgBtn.addEventListener("click", () => {
    imageModal.classList.remove("hidden");
    imageModal.classList.add("flex");
  });
}

if (editImageClose) {
  editImageClose.addEventListener("click", () => {
    imageModal.classList.add("hidden");
    imageModal.classList.remove("flex");
  });
}

// Cover Photo Modal
const coverModal = document.getElementById("coverModal");
const openCoverBtn = document.getElementById("openCoverModal");
const closeCoverBtn = document.getElementById("closeCoverModal");

if (openCoverBtn) {
  openCoverBtn.addEventListener("click", () => {
    coverModal.classList.remove("hidden");
    coverModal.classList.add("flex");
  });
}

if (closeCoverBtn) {
  closeCoverBtn.addEventListener("click", () => {
    coverModal.classList.add("hidden");
    coverModal.classList.remove("flex");
  });
}
