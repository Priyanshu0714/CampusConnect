console.log("hello world")

document.querySelector("form").addEventListener("submit",async(event)=>{
    event.preventDefault();
    const message=document.getElementById("message").value.trim()   ;
    if(!message){
        return;
    }
    const chatdiv=document.createElement("div")
    chatdiv.className="py-2 px-3 border border-[#bee84a] rounded-full text-lg flex flex-row-reverse gap-3"
    const logo=document.createElement("div")
    logo.innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="#000000" fill="none">
    <path d="M7 14.9999C5.34315 14.9999 4 16.343 4 17.9999C4 19.6567 5.34315 20.9999 7 20.9999C8.65685 20.9999 10 19.6567 10 17.9999C10 16.343 8.65685 14.9999 7 14.9999Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M17 14.9999C15.3431 14.9999 14 16.343 14 17.9999C14 19.6567 15.3431 20.9999 17 20.9999C18.6569 20.9999 20 19.6567 20 17.9999C20 16.343 18.6569 14.9999 17 14.9999Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M14 17H10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M22 12.9999C19.5434 11.7724 15.9734 10.9999 12 10.9999C8.02658 10.9999 4.45659 11.7724 2 12.9999" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M19 11.4999L17.9425 4.71233C17.7268 3.32807 16.2232 2.578 15.0093 3.24907L14.3943 3.58903C12.9019 4.414 11.0981 4.414 9.60574 3.58903L8.99074 3.24907C7.77676 2.578 6.27318 3.32808 6.05751 4.71233L5 11.4999" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
</svg>`
    chatdiv.innerText=message
    chatdiv.appendChild(logo);
    document.getElementById("chattingarea").appendChild(chatdiv)
    document.getElementById("message").value="";

    const request=await fetch("/anyonomousChat/",{
        method:"POST",
        headers: {
            "Content-Type": "application/json",
        },
        body:JSON.stringify({message})
    })
    const response=await request.json()
    if(!response.success){
        window.alert("Unable to send!")
    }
})

document.getElementById("HomePage").addEventListener("click",()=>{
    window.location.href="/"
})