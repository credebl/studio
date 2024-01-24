import {
	imageSizeAccepted,
} from '../../config/CommonConstant';

export const processImage = (event, callback) => {
  const reader = new FileReader();
  const file = event?.target?.files;

  const fileSize = Number((file[0]?.size / 1024 / 1024)?.toFixed(2));
  const extension = file[0]?.name
    ?.substring(file[0]?.name?.lastIndexOf('.') + 1)
    ?.toLowerCase();

  if (
    (extension === 'png' || extension === 'jpeg' || extension === 'jpg') &&
    fileSize <= imageSizeAccepted
  ) {
    reader.onloadend = () => {
      callback(reader.result);
    };
    reader.readAsDataURL(file[0]);
    event.preventDefault();
  } else {
    callback(null, extension === 'png' || extension === 'jpeg' || extension === 'jpg' ? 'Please check image size' : 'Invalid image type');
  }
};
