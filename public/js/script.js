document.getElementById("profile_section").addEventListener("click",()=>{
    window.location.href="/profile"
})

// to open the search bar
document.getElementById("searchbutton").addEventListener("click",()=>{
    document.getElementById("searchpage").classList.replace("hidden","flex")
})
// to close the seachbar
document.getElementById("closesearchbar").addEventListener("click",()=>{
    document.getElementById("searchpage").classList.replace("flex","hidden")
})
// for the onchange event of searchbar to display result
document.getElementById("searchuserid").addEventListener("input",async()=>{
    const user=document.getElementById("searchuserid").value
    const response=await fetch("/profile/searchuser",{
        method:"POST",
        headers: {
            "Content-Type": "application/json",
        },
        body:JSON.stringify({
            searchkeyword:user
        })
    })
    const {data}=await response.json()
    const div=document.getElementById("searchuserdisplay")    
    div.innerHTML=""
    data.forEach(element => {
      div.innerHTML+=`<div data-id="${element._id}" class="searchUserFound w-full h-14 rounded-full flex items-center justify-start px-5 flex-row gap-4 translate-y-5 opacity-0 transition-all delay-0 duration-500 ease-out animate-slide-up cursor-pointer">
                <img class="h-10 w-10 rounded-full object-contain border border-black p-1" src="/images/profileicon.svg" alt="">
                <div class="flex items-start justify-center flex-col flex-shrink-0">
                    <div class="text-sm">${element.username}</div>
                    <div class="text-[13px]">${element.name}</div>
                </div>
            </div>`
    });
    document.querySelectorAll(".searchUserFound").forEach((e)=>{
        e.addEventListener("click",async()=>{
            // data id
            const user=e.getAttribute('data-id')
            console.log(user)
            window.location.href = `/profile/userprofile/${user}`;
            // const response=await request.json()
        })
    })
})