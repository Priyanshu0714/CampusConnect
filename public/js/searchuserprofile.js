document.getElementById("backbutton").addEventListener("click",()=>{
    window.location.href="/"
})

document.querySelector(".followuser").addEventListener("click",async()=>{
    const userid=document.querySelector(".followuser").id
    const response=await fetch("/profile/followuser",{
        method:"POST",
        headers: {
            "Content-Type": "application/json",
        },
        body:JSON.stringify({userid})
    })
    const data=await response.json()
    if(data.success){
        console.log(document.querySelector(".followuser").innerHTML)
    }
})
// to change the follow button color by the status
const followStatusDiv=document.querySelector(".followstatus")

if((followStatusDiv.innerHTML.trim())=='Unfollow'){
    followStatusDiv.classList.replace("bg-gray-200","bg-[#bee84a]")
}

// to follow user and unfollow
const followingID=document.querySelector(".followstatus").parentElement.id
document.getElementById(followingID).addEventListener("click",()=>{
    const element=document.querySelector(".followstatus")
    
    if(element.innerHTML.trim()="Unfollow"){
        element.classList.replace("bg-[#bee84a]","bg-gray-200")
        element.innerHTML="Follow"
    }else{
        element.classList.replace("bg-gray-200","bg-[#bee84a]")
        element.innerHTML="Unfollow"
    }

})