export default function BrandMark() {
  return (
    <span className="brand-mark">
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 7H17a5 5 0 010 10H12V7z" fill="white" />
        <path
          d="M12 7H7a5 5 0 000 10H12V7zM12 9H7a3 3 0 000 6H12V9z"
          fill="var(--navy)"
          fillRule="evenodd"
        />
      </svg>
    </span>
  );
}
