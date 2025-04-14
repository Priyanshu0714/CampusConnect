document.getElementById("backbutton").addEventListener("click",()=>{
    window.location.href="/"
})

document.getElementById("edit").addEventListener("click",()=>{
    arr=['profilepart1','profilepart2','profilepart3']
    arr.forEach(element => {
        document.getElementById(element).classList.replace("flex","hidden")
    });
    document.getElementById("editprofile").classList.replace('hidden',"flex")
})

document.getElementById("saveContinue").addEventListener("click",async()=>{
    newname=document.getElementById("newname").value
    newbio=document.getElementById("newbio").value
    const request=await fetch("/profile/editprofile",{
        method:"POST",
        headers: {
            "Content-Type": "application/json",
        },
        body:JSON.stringify({
            newname,
            newbio,
        })
    })
    const response=await request.json();
    if(response.success){
       window.location.href="/profile" 
    }
    else{
        console.log("Error updating profile!!")
    }
})
document.getElementById("closeEdit").addEventListener("click",()=>{
    arr=['profilepart1','profilepart2','profilepart3']
    arr.forEach(element => {
        document.getElementById(element).classList.replace("hidden","flex")
    });
    document.getElementById("editprofile").classList.replace('flex',"hidden")
})

document.getElementById("editImageClose").addEventListener("click",()=>{
    arr=['profilepart1','profilepart2','profilepart3']
    arr.forEach(element => {
        document.getElementById(element).classList.replace("hidden","flex")
    });
    document.getElementById("editImage").classList.replace("flex","hidden")
})
// for the profile image window close
document.getElementById("userprofileImage").addEventListener("click",()=>{
    arr=['profilepart1','profilepart2','profilepart3']
    arr.forEach(element => {
        document.getElementById(element).classList.replace("flex","hidden")
    });
    document.getElementById("editImage").classList.replace("hidden","flex")
})
