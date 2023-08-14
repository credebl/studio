import { Avatar } from "flowbite-react";
import { useState } from "react";
import { asset } from "../../lib/data";

interface ILogoImage {
  logoFile: string | File
  imagePreviewUrl: string | ArrayBuffer | null | File,
}

const EditUserProfile = ({ toggleEditProfile }: { toggleEditProfile: () => void }) => {
  const [logoImage, setLogoImage] = useState<ILogoImage>({
    logoFile: "",
    imagePreviewUrl: "",
  })


  return (
    <div
      className="mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 md:p-8 dark:bg-gray-800"
    >

      <div className="flow-root">
        <ul>

          <li className="flex items-start justify-between pb-4">


            {
              typeof (logoImage.logoFile) === "string" ?
                <Avatar placeholderInitials="BK"
                  size="lg"
                /> :
                <img
                  className="mb-4 rounded-lg w-28 h-28 sm:mb-0 xl:mb-4 2xl:mb-0"
                  src={typeof (logoImage.logoFile) === "string" ? asset('images/users/bonnie-green-2x.png') : URL.createObjectURL(logoImage.logoFile)}
                  alt="Jese picture"
                />
            }

            <button
              type="button"
              className=""
              onClick={toggleEditProfile}
            >
              <svg className="mr-1 mt-8 w-7 h-6"
                width="24" height="24"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" />
                <line x1="5" y1="12" x2="19" y2="12" />
                <line x1="5" y1="12" x2="11" y2="18" />
                <line x1="5" y1="12" x2="11" y2="6" />
              </svg>

            </button>


          </li>

          <li className="py-3">
            <div className="flex items-center space-x-4">
              <div className="flex-1 min-w-0">
                <p
                  className="text-lg font-normal text-gray-500 truncate dark:text-gray-400"

                >
                  Name
                </p>
                <p
                  className="text-lg text-black truncate dark:text-white"

                >
                  Bhavana Karwade
                </p>
              </div>

            </div>
          </li>
          <li className="py-3">
            <div className="flex items-center space-x-4">

              <div className="flex-1 min-w-0">
                <p
                  className="text-lg font-normal text-gray-500 truncate dark:text-gray-400"

                >
                  Email
                </p>
                <p
                  className="text-lg text-black truncate dark:text-white"

                >
                  bhavana13@yopmail.com
                </p>
              </div>
            </div>
          </li>

          <li className="py-3">
            <div className="flex items-center space-x-4">

              <div className="flex-1 min-w-0">
                <p
                  className="text-lg font-normal text-gray-500 truncate dark:text-gray-400"

                >
                  Passkey
                </p>
                <p
                  className="text-lg text-black truncate dark:text-white"

                >
                  abcdefghijklmnopqrstuvwxyz
                </p>
              </div>
            </div>
          </li>

        </ul>
      </div>

    </div>

  );
};

export default EditUserProfile;
