
exports.handler = async (event, context) => {
  const user = context.clientContext?.user;
  if(!user || !(user.app_metadata && user.app_metadata.roles && user.app_metadata.roles.includes('admin'))){
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }
  return { statusCode: 200, body: JSON.stringify([]) };
};
