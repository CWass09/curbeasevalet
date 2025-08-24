
exports.handler = async (event)=>{
  const headers={
    "Access-Control-Allow-Origin":"*",
    "Access-Control-Allow-Methods":"GET,OPTIONS",
    "Access-Control-Allow-Headers":"Content-Type"
  };
  if(event.httpMethod==='OPTIONS'){ return {statusCode:200, headers}; }
  const src=(event.queryStringParameters||{}).src;
  if(!src){ return {statusCode:400, headers, body:"Missing src"}; }
  try{
    const res = await fetch(src);
    const text = await res.text();
    return {statusCode:200, headers:{...headers,"Content-Type":"text/plain"}, body:text};
  }catch(e){
    return {statusCode:502, headers, body:String(e)};
  }
}
