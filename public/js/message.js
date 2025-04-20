let chattingid=null;

document.getElementById("chatprofile").addEventListener("click",()=>{
    document.getElementById("chatprofile").classList.replace("w-full","w-[30%]")
    document.getElementById("chatbox").classList.replace("hidden","flex")
    document.getElementById("chatprofile").classList.add("border-r")
    document.getElementById("chatprofile").classList.add("border-gray-300")
    document.querySelectorAll(".chatname").forEach(i=>{
        // i.classList.add("hidden")
        const value=i.innerHTML
        let result=value.slice(0,10)+"..."
        i.innerHTML=result;
})
    const currentMessageid=document.getElementById("chatprofile").firstElementChild.id
    chattingid=currentMessageid;
})

document.getElementById("sendmessage").addEventListener("click",async()=>{
    const message=document.getElementById("message").value.trim()
    if(!message){
        return;
    }

    const chatdiv=document.getElementById("chat")
    const childdiv=document.createElement("div")
    childdiv.className="w-1/3 h-auto p-2 border border-gray-300 float-right clear-both rounded-2xl"
    childdiv.textContent=message;
    // first sending the message to the backend before appending
    const request=await fetch("/message/m",{
        method:"POST",
        headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            receiverID:chattingid,
            message:message
          }),
    })
    const response=await request.json();
    if(response.success){
        console.log("working")
    }
    else{
        console.log("error occured")
        return;
    }
    // append child expect a dom not an html string
    chatdiv.appendChild(childdiv)

    document.getElementById("message").value="";
    document.getElementById("message").focus()
})

document.getElementById("anyonomousIcon").addEventListener("click",async()=>{
    window.location.href="http://localhost:3000/anyonomousChat/"
  })
  document.getElementById("profile_section").addEventListener("click",()=>{
    window.location.href="http://localhost:3000/profile/"
  })
  document.getElementById("home").addEventListener("click",()=>{
    window.location.href="http://localhost:3000/"
  })

// when ever the user clicks the profile the chats load
document.querySelectorAll(".chatprofileuser").forEach(user=>{
  user.addEventListener("click",async()=>{
    
    // send the message to load chat in the chatbox
    const request=await fetch("/message/load",{
      method:"POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id:user.id
      }),
    })

    const response=await request.json();
    if(response.success){
      const userarray=response.messagesList
      // to load chat accordingly
      const div=document.getElementById("chat")
      userarray.forEach(element => {
        const childDiv=document.createElement("div")
        if(element.senderID==response.sessionID){
          childDiv.className="w-1/3 h-auto p-2 border border-gray-300 float-right clear-both rounded-2xl"
        }else{
          childDiv.className="w-1/3 h-auto p-2 border border-gray-300 float-left clear-both rounded-2xl"
        }
        childDiv.textContent=element.message
        div.appendChild(childDiv);
      });
      console.log(response)
    }else{
      console.log("error while fetching messages")
    }
  })
})

document.getElementById("closeMessage").addEventListener("click",()=>{
  window.location.href="http://localhost:3000/"
})

document.addEventListener("keydown",(e)=>{
  if(e.key=="Enter"){
    document.getElementById("sendmessage").click()
  }
})