const TypingIndicator = ({ className = '' }) => {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex space-x-1.5 px-4 py-3 bg-gray-100 rounded-2xl shadow-md">
        <div className="w-2.5 h-2.5 bg-[#013220] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2.5 h-2.5 bg-[#013220] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2.5 h-2.5 bg-[#013220] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  );
};

export default TypingIndicator;
