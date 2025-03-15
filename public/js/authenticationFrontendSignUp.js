document.getElementById("signin").addEventListener("click",()=>{
    window.location.href="/authentication/"
})
// for manual form submit 
document.querySelector(".form_container").addEventListener("submit",async(event)=>{
    event.preventDefault()

    const username=document.getElementById("username").value
    const name=document.getElementById("name").value
    const email=document.getElementById("email_field").value
    const password=document.getElementById("password_field").value
    const response=await fetch("/authentication/signup",{
        method:"POST",
        headers: {
            "Content-Type": "application/json",
        },
        body:JSON.stringify({username,name,email,password})
    })
    const data=await response.json()
    if(!data.success){
        document.getElementById("ifincorrect").classList.remove("hidden")
    }
    else{
        window.location.href="/"
    }
})