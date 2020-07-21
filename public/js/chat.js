const socket = io()
// Message input
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')

//Location button
const $locationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')
// Templates

const messageTemplate = document.querySelector('#message-template').innerHTML
const locaTemplate = document.querySelector('#locaton-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML
//Options

const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true} )

const autoscroll = ()=>{
    //New message element
    const $newMessage = $messages.lastElementChild

    //Height of the new message
    const newMessageStyle = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyle.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

   //Visible height
   const visibleHeight = $messages.offsetHeight

   //Height of messages container

   const containerHeight = $messages.scrollHeight
    // How far have I scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight
    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('redirect', (msg)=>{
    
    const html = Mustache.render(messageTemplate, {
        username: msg.username,
        message: msg.text,
        time: moment(msg.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})


socket.on('locationMessage', (url)=>{
    const html = Mustache.render(locaTemplate, {
        username: url.username,
        loca: url.location,
        time: moment(url.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
    
})

socket.on('roomData', ({ room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room: room,
        users: users
    })
    document.querySelector('#sidebar').innerHTML = html
})



$messageForm.addEventListener('submit', function(event){
 event.preventDefault()
 $messageFormButton.setAttribute('disabled', 'disabled')
 const inputText = event.target.elements.msg.value
 
 socket.emit("sendMessage", inputText, (error)=>{
    $messageFormButton.removeAttribute('disabled')
    $messageFormInput.value = ""
    $messageFormInput.focus()
     if(error){
         return console.log(error);
         
     }
     console.log('Message delivered!');
     
     
 })

})

$locationButton.addEventListener('click', function(){
    $locationButton.setAttribute('disabled', 'disabled')
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser.')
    }
    navigator.geolocation.getCurrentPosition((position)=>{
        
       
        socket.emit("sendLocation", {
            latit: position.coords.latitude,
            long: position.coords.longitude
        }, (cb)=>{
            $locationButton.removeAttribute('disabled')
            console.log(cb);
            
        })
    })


})

socket.emit('join', {username, room}, (error)=>{
    if(error){
        alert(error)
        location.href = '/'
    }
})