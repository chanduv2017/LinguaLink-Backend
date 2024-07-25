
function getUsernameFromToken(token:string) {
  // Split the token into its parts: header, payload, and signature
  const tokenParts = token.split('.');

  // Extract the payload part
  const encodedPayload = tokenParts[1];

  // Decode the payload from base64
  const decodedPayload = atob(encodedPayload);

  // Parse the decoded payload as JSON
  const payload = JSON.parse(decodedPayload);

  // Retrieve the username from the payload
  const username = payload.username; // Assuming the username is stored in the payload

  return username;
}
export default getUsernameFromToken;