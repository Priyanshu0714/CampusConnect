document.getElementById("signup").addEventListener("click",()=>{
    window.location.href="/authentication/signup"
})

// for manual form submit 
document.querySelector(".form_container").addEventListener("submit",async(event)=>{
    event.preventDefault()

    const username=document.getElementById("username").value
    const password=document.getElementById("password_field").value
    const response=await fetch("/authentication/",{
        method:"POST",
        headers: {
            "Content-Type": "application/json",
        },
        body:JSON.stringify({username,password})
    })
    const data=await response.json()
    if(!data.success){
        document.getElementById("ifincorrect").classList.remove("hidden")
    }
    else{
        window.location.href="/"
    }
})