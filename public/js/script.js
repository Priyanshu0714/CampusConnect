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
                <img class="h-10 w-10 rounded-full object-contain" src="${element.profileimg}" alt="">
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
    const request = await fetch("/like/", {
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
  window.location.href="http://localhost:3000/anyonomousChat/"
})
document.getElementById("messagebutton").addEventListener("click",()=>{
  window.location.href="http://localhost:3000/message/"
})
document.getElementById("home").addEventListener("click",()=>{
  window.location.href="http://localhost:3000/"
})

document.getElementById("storiesUpload").addEventListener("click",()=>{
  document.getElementById("storyupload").classList.replace("hidden","flex");
})

document.getElementById("storydivClose").addEventListener("click",()=>{
  document.getElementById("storyupload").classList.replace("flex","hidden");
})

document.getElementById("storiesView").addEventListener("click",async()=>{
  document.getElementById("storyView").classList.remove("hidden")
  const request=await fetch("/stories",{
    method:"POST",
    headers: {
      "Content-Type": "application/json",
    }
  })

  const response=await request.json()
  let imgdiv=  document.getElementById("storyView").lastElementChild.firstElementChild

  imgdiv.src=response.StoryLink;
})

document.getElementById("CloseStory").addEventListener("click",()=>{
  document.getElementById("storyView").classList.add("hidden")
})
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
document.getElementById("OptionStory").addEventListener("click",async()=>{
  document.getElementById("commingsoon").classList.remove("hidden");
  await wait(1000); 
  document.getElementById("commingsoon").classList.add("hidden");
})

document.querySelectorAll(".stories").forEach(story=>{
  story.addEventListener("click",()=>{
    document.getElementById("storyView").lastElementChild.firstElementChild.src=story.id
    document.getElementById("storyView").classList.remove("hidden")
    document.getElementById("storyView").firstElementChild.firstElementChild.textContent="Stories"
  })
})

// for the comments part
document.querySelectorAll(".comments").forEach(e=>{
  e.addEventListener("click",async()=>{
    console.log("comment clicked")
    const MainparentDiv=e.parentElement.parentElement.parentElement
    // const child2=document.querySelectorAll()
    MainparentDiv.childNodes[7].classList.add("hidden")
    MainparentDiv.childNodes[11].classList.remove("hidden")
    const postid=e.parentElement.parentElement.previousElementSibling.firstElementChild.firstElementChild.id
    const commentdiv=e.parentElement.parentElement.previousElementSibling.lastElementChild
    // to send the request to backend to get the comments in the post
    const request=await fetch("/comment/getdata",{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        postid,
      })
    })
    const response=await request.json();
    console.log(response)
    if(!response.success){
      return;
    }
    const postarray=response.postComments
    postarray.forEach(i=>{
      console.log(i)
      const div=document.createElement("div")
      div.className="max-w-[90%] border border-gray-300 float-left clear-both rounded-lg p-2"
      div.textContent=i.comment
      const newdiv=document.createElement("div")
      newdiv.className="text-gray-400 text-xs"
      newdiv.textContent=" by "+i.userName;
      div.appendChild(newdiv)
      commentdiv.appendChild(div)
    })
    
  })
})

document.querySelectorAll(".commentClose").forEach(e=>{
  e.addEventListener("click",()=>{
    const MainparentDiv=e.parentElement.parentElement.parentElement
    MainparentDiv.childNodes[7].classList.remove("hidden")
    MainparentDiv.childNodes[11].classList.add("hidden")
  })
})

// to submit comment
document.querySelectorAll(".submitComment").forEach(element => {
  element.addEventListener("click",async()=>{
    const message=element.parentElement.firstElementChild.value
    const postid=element.parentElement.id
    const chatdiv=element.parentElement.parentElement.nextElementSibling.nextElementSibling
    if(message.length==0){
      return;
    }
    const request=await fetch("/comment",{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        message,
        postid,
      })
    })
    
    const response=await request.json()
    if(!response.success){
      console.log("some error occured while receiving the message at backend")
      return;
    }
    const div=document.createElement("div")
    div.className="max-w-[90%] border border-gray-300 float-left clear-both rounded-lg p-2"
    div.textContent=message
    chatdiv.appendChild(div)
    element.parentElement.firstElementChild.value=""
  })
});
