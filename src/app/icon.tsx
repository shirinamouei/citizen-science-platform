import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";
export const dynamic = "force-static";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 16,
          background: "linear-gradient(135deg, #FF9500, #F4BA41)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
          <path d="M12 7H17a5 5 0 010 10H12V7z" fill="white" />
          <path
            d="M12 7H7a5 5 0 000 10H12V7zM12 9H7a3 3 0 000 6H12V9z"
            fill="#112845"
            fillRule="evenodd"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}
