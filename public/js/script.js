document.getElementById("profile_section").addEventListener("click", () => {
  window.location.href = "/profile";
});

// to open the search bar
document.getElementById("searchbutton").addEventListener("click", () => {
  document.getElementById("searchpage").classList.replace("hidden", "flex");
});
// to close the seachbar
document.getElementById("closesearchbar").addEventListener("click", () => {
  document.getElementById("searchpage").classList.replace("flex", "hidden");
});
// for the onchange event of searchbar to display result
document.getElementById("searchuserid").addEventListener("input", async () => {
  const user = document.getElementById("searchuserid").value;
  const response = await fetch("/profile/searchuser", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      searchkeyword: user,
    }),
  });
  const { data } = await response.json();
  const div = document.getElementById("searchuserdisplay");
  div.innerHTML = "";
  data.forEach((element) => {
    div.innerHTML += `<div data-id="${element._id}" class="searchUserFound w-full h-14 rounded-full flex items-center justify-start px-5 flex-row gap-4 translate-y-5 opacity-0 transition-all delay-0 duration-500 ease-out animate-slide-up cursor-pointer">
                <img class="h-10 w-10 rounded-full object-contain border border-black p-1" src="/images/profileicon.svg" alt="">
                <div class="flex items-start justify-center flex-col flex-shrink-0">
                    <div class="text-sm">${element.username}</div>
                    <div class="text-[13px]">${element.name}</div>
                </div>
            </div>`;
  });
  document.querySelectorAll(".searchUserFound").forEach((e) => {
    e.addEventListener("click", async () => {
      // data id
      const user = e.getAttribute("data-id");
      console.log(user);
      window.location.href = `/profile/userprofile/${user}`;
      // const response=await request.json()
    });
  });
});

document.getElementById("uploadPostIcon").addEventListener("click", () => {
  console.log("yes");
  document.getElementById("postupload").classList.replace("hidden", "flex");
});
document.getElementById("postdivClose").addEventListener("click", () => {
  document.getElementById("postupload").classList.replace("flex", "hidden");
});

document.querySelectorAll(".userlikebutton").forEach((button) => {
  let sending = false;
  button.addEventListener("click", async () => {
    if (sending) {
      return;
    }
    sending=true;
    const postid = button.firstElementChild.id;
    const request = await fetch("/like", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: postid,
      }),
    });
    const response=await request.json()
    console.log(response)
    if(response.success){
      const countDiv = button.lastElementChild;
      const currentLikes = parseInt(countDiv.innerHTML);
      countDiv.innerHTML = currentLikes + 1;
      const likeDiv=button.firstElementChild;
      likeDiv.src="https://cdn.tirabeauty.com/v2/billowing-snowflake-434234/tira-p/wrkr/organization/62d539deb767fec5c06847bd/theme/assets/wishlist-selected.e1d3324ddd4f0001c62e7a8472402679.svg"
    }else{
      const countDiv = button.lastElementChild;
      const currentLikes = parseInt(countDiv.innerHTML);
      countDiv.innerHTML = currentLikes - 1;
      const likeDiv=button.firstElementChild;
      likeDiv.src="https://cdn.tirabeauty.com/v2/billowing-snowflake-434234/tira-p/wrkr/organization/62d539deb767fec5c06847bd/theme/assets/wishlist-icon.1345c266e68871fdd7b62ace4997580a.svg"
    }
    sending=false;
  });
});

document.getElementById("anyonomousIcon").addEventListener("click",async()=>{
  console.log("hello world")
  window.location.href="http://localhost:3000/anyonomousChat/"
})