interface ColorCheckboxProps {
  color: string;
  onClick?: () => void;
  value?: boolean;
  label: string;
}

export default function ColorCheckbox({ color, onClick, value = false, label }: ColorCheckboxProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center justify-center px-4 py-1.5 rounded-full transition-all duration-200 border text-sm font-medium cursor-pointer
        ${value ? 'text-white border-transparent' : 'bg-transparent text-gray-500 border-gray-300'}
      `}
      style={{
        backgroundColor: value ? color : 'transparent',
      }}
    >
      {label}
    </button>
  );
}
