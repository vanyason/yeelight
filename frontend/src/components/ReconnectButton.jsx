export default function ReconnectButton({ onClick }) {
  return (
    <button
      type="button"
      className="flex items-center w-40 gap-4 rounded-lg border border-gray-300 py-3 px-6 text-center align-middle text-xs font-bold uppercase  hover:opacity-80 hover:border-violet-300 active:scale-95"
      onClick={onClick}
    >
      Reconnect
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" width="16" height="16">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
        ></path>
      </svg>
    </button>
  );
}
