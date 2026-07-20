import { API_BASE_URL } from "@/utils/config";


export const getRenderImageUrl = (imagePath) => {
  console.log(imagePath);
  if (!imagePath) return '';
  
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  const baseUrl = API_BASE_URL + '/users/avatars'
  console.log(baseUrl);
  return `${baseUrl}${imagePath}`;
};