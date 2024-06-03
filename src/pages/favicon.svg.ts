import type {  APIRoute } from "astro";

export const GET: APIRoute = function get(/* { params, request } */) {
	/* IDEA: Can be dynamicized (alternative colors…) */

	const icon = /* html */ `
<svg xmlns="http://www.w3.org/2000/svg" width="33" height="33" fill="none" viewBox="0 0 990 990">  <path fill="#25AFE1" d="M990 495c0 273.381-221.619 495-495 495S0 768.381 0 495 221.619 0 495 0s495 221.619 495 495Zm-919.266 0c0 234.316 189.95 424.266 424.266 424.266 234.316 0 424.266-189.95 424.266-424.266 0-234.316-189.95-424.266-424.266-424.266-234.316 0-424.266 189.95-424.266 424.266Z"/>  <path fill="#1F4EAD" d="M713.668 246.476a45.215 45.215 0 0 0-63.78-4.099c-37.468 33.082-102.981 133.254-144.16 241.578-9.513 25.033-17.856 50.711-24.453 76.413-31.134-48.44-57.165-77.525-88.526-112.626-21.578-24.125-45.894-51.333-77.213-91.538a45.146 45.146 0 0 0-63.355-8.109 45.19 45.19 0 0 0-8.092 63.379c32.628 41.897 58.378 70.694 81.217 96.253 47.466 53.065 81.433 91.089 146.671 221.475 7.762 19.242 28.092 31.242 49.408 27.686a45.28 45.28 0 0 0 37.211-52.079c-8.97-53.884 6.681-122.911 31.702-188.722 36.243-95.296 89.912-179.926 119.265-205.855a45.178 45.178 0 0 0 4.105-63.756Z"/>  <path fill="#1F4EAD" d="M417.511 184.358c-12.957 3.177-9.433 19.125 1.218 13.832.19 0 61.848-20.72 102.257 43.488 4.965 7.889 11.601-2.32 8.909-7.923-8.508-17.711-45.208-65.876-112.386-49.399l.002.002ZM388.21 317.161c-7.643-49.107 12.933-81.658 38.534-88.257 60.936-15.708 91.084 59.412 91.084 98.928 0 38.558-27.516 55.537-47.129 53.816-32.954-2.894-48.47-37.364-53.258-64.202-1.17-6.541-10.25-56.885 30.441-57.189 27.711-.204 43.29 47.756 41.472 66.237-1.189 12.076-6.856 24.689-19.681 23.563-17.098-1.5-23.37-26.075-24.233-35.785-.19-1.541-3.69-20.584 5.621-18.973 6.422 1.112 7.993 13.066 8.213 13.848.895 2.867 1.503 6.47 1.872 9.799.391 2.822-.247 6.061.887 9.203 1.112 3.649 4.308 5.703 7.076 5.947 2.262.198 6.582-2.116 6.728-5.654.293-18.818-7.586-52.303-29.789-50.333-12.486 1.107-19.071 15.399-15.514 38.444 3.465 22.443 15.15 47.119 38.249 49.145 25.395 2.23 35.623-20.926 35.623-38.374 0-49.752-33.648-95.413-73.413-81.745-22.836 7.849-36.695 32.709-28.895 73.253 8.085 42.032 32.953 80.598 69.035 79.553 66.058-1.915 61.47-72.276 61.47-72.276 0-64.653-52.384-139.455-119.563-110.328-27.695 12.011-49.356 52.507-41.179 101.915 20.744 125.336 111.323 110.938 115.553 110.287l.317.035c14.453-2.092 11.498-18.208.923-16.398-59.973 10.269-92.351-42.454-100.444-94.459Z"/>  <path fill="#1F4EAD" d="M842.325 193.955c14.76-12.793 16.44-35.231 2.626-49.04a495.005 495.005 0 0 0-524.919-112.96A494.998 494.998 0 0 0 91.38 781.559a495.006 495.006 0 0 0 533.04 191.223 494.998 494.998 0 0 0 226.376-133.639c13.58-14.04 11.522-36.447-3.451-48.989-14.973-12.543-37.18-10.453-50.926 3.424a424.272 424.272 0 0 1-444.681 100.769 424.269 424.269 0 0 1-6.704-796.225 424.267 424.267 0 0 1 446.315 93.267c13.977 13.643 36.216 15.36 50.976 2.566Z"/></svg>`;

	return {
		body: icon,
		headers: {
			'Content-Type': 'image/svg+xml',
		},
	};
};
