import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PageSearchBar = ({
  value,
  onChange,
  initialValue = '',
  placeholder = 'Search books...',
  buttonText = 'Search',
  onSearch,
  allowEmptySubmit = false,
  className = '',
}) => {
  const navigate = useNavigate();
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(initialValue);
  const inputValue = isControlled ? value : internalValue;

  useEffect(() => {
    if (!isControlled) {
      setInternalValue(initialValue);
    }
  }, [initialValue]);

  const submit = (e) => {
    e?.preventDefault?.();

    const q = String(inputValue || '').trim();
    if (!q && !allowEmptySubmit) return;

    if (onSearch) {
      onSearch(q);
      return;
    }

    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <form
      onSubmit={submit}
      className={`flex items-center border pl-4 gap-2 bg-gray-800/50 backdrop-blur-xl border-gray-700/50 h-[46px] rounded-full overflow-hidden w-full ${className}`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 30 30" fill="#9CA3AF">
        <path d="M13 3C7.489 3 3 7.489 3 13s4.489 10 10 10a9.95 9.95 0 0 0 6.322-2.264l5.971 5.971a1 1 0 1 0 1.414-1.414l-5.97-5.97A9.95 9.95 0 0 0 23 13c0-5.511-4.489-10-10-10m0 2c4.43 0 8 3.57 8 8s-3.57 8-8 8-8-3.57-8-8 3.57-8 8-8" />
      </svg>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => {
          const next = e.target.value;
          if (!isControlled) {
            setInternalValue(next);
          }
          if (onChange) {
            onChange(next);
          }
        }}
        placeholder={placeholder}
        className="w-full h-full outline-none text-sm text-gray-200 placeholder:text-gray-500 bg-transparent"
      />
      <button
        type="submit"
        className="bg-green-600 w-28 h-9 rounded-full text-sm text-white mr-[5px] hover:bg-green-700 transition-colors"
      >
        {buttonText}
      </button>
    </form>
  );
};

export default PageSearchBar;
