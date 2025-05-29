function createConsoleTimestamp (date = new Date()){
  const pad = (num)=> num.toString().padStart(2, "0")
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  return `${pad(date.getDate())}-${months[date.getMonth()]}-${String(date.getFullYear()).slice(-2)}@${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}