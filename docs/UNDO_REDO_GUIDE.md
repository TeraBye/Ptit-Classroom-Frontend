# Undo/Redo Implementation Guide

## Tổng quan

Chức năng Undo/Redo đã được implement với best practices, bao gồm:

### Features chính:
- ✅ **Debounced updates** - Tránh spam history khi user type nhanh
- ✅ **Keyboard shortcuts** - Ctrl+Z (Undo), Ctrl+Y (Redo)
- ✅ **Auto-save** - Tự động lưu vào localStorage
- ✅ **Memory efficient** - Giới hạn số lượng history entries
- ✅ **TypeScript support** - Full type safety
- ✅ **Reusable hooks** - Có thể sử dụng cho nhiều components khác nhau

## Cách sử dụng

### 1. Basic Usage với useUndoRedo hook

```typescript
import { useUndoRedo } from '@/utils/useUndoRedo';

function MyComponent() {
  const {
    state,
    canUndo,
    canRedo,
    undo,
    redo,
    setState
  } = useUndoRedo(initialState, {
    maxHistory: 50,    // Số lượng history entries tối đa
    debounceMs: 300,   // Delay trước khi lưu vào history
    autoSave: true     // Tự động lưu vào localStorage
  });

  return (
    <div>
      <button onClick={undo} disabled={!canUndo}>Undo</button>
      <button onClick={redo} disabled={!canRedo}>Redo</button>
      <input 
        value={state.value} 
        onChange={(e) => setState({ ...state, value: e.target.value })}
      />
    </div>
  );
}
```

### 2. Form-specific usage với useFormUndoRedo

```typescript
import { useFormUndoRedo } from '@/utils/useUndoRedo';

function MyForm() {
  const {
    state: form,
    canUndo,
    canRedo,
    undo,
    redo,
    updateField,
    updateMultipleFields
  } = useFormUndoRedo(initialForm);

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateField(name, value);
  };

  return (
    <form>
      <input 
        name="title"
        value={form.title}
        onChange={handleChange}
      />
      {/* ... other fields */}
    </form>
  );
}
```

### 3. Sử dụng với UI Controls

```typescript
import UndoRedoControls from '@/components/Common/UndoRedoControls';

function MyComponent() {
  const undoRedo = useUndoRedo(initialState);

  return (
    <div>
      <UndoRedoControls
        canUndo={undoRedo.canUndo}
        canRedo={undoRedo.canRedo}
        onUndo={undoRedo.undo}
        onRedo={undoRedo.redo}
        showKeyboardShortcuts={true}
      />
      {/* Your content */}
    </div>
  );
}
```

## Keyboard Shortcuts

- **Ctrl+Z**: Undo
- **Ctrl+Y** hoặc **Ctrl+Shift+Z**: Redo

## Configuration Options

### useUndoRedo Options:
```typescript
interface UseUndoRedoOptions {
  maxHistory?: number;    // Default: 50
  debounceMs?: number;    // Default: 300ms
  autoSave?: boolean;     // Default: false
}
```

### useFormUndoRedo Options:
Tương tự như useUndoRedo, nhưng được tối ưu cho forms.

## Best Practices

### 1. Memory Management
- Sử dụng `maxHistory` để giới hạn memory usage
- Clear history khi không cần thiết: `clearHistory()`

### 2. Performance
- Sử dụng `debounceMs` để tránh spam history
- Chỉ track những thay đổi quan trọng

### 3. User Experience
- Hiển thị trạng thái undo/redo (canUndo, canRedo)
- Cung cấp keyboard shortcuts
- Auto-save để tránh mất dữ liệu

### 4. TypeScript
- Sử dụng generic types để type safety
- Define interfaces cho form data

## Ví dụ thực tế trong Questions Form

Trong `QuestionFormWithUndoRedo.tsx`:

```typescript
const {
  state: undoRedoForm,
  canUndo,
  canRedo,
  undo,
  redo,
  updateField,
  clearHistory
} = useFormUndoRedo(form, {
  maxHistory: 20,      // Giới hạn 20 changes
  debounceMs: 500,     // Delay 500ms
  autoSave: true       // Tự động lưu
});
```

## Troubleshooting

### 1. History không được lưu
- Kiểm tra `debounceMs` có quá cao không
- Đảm bảo `setState` được gọi đúng cách

### 2. Memory leak
- Giảm `maxHistory` nếu cần
- Gọi `clearHistory()` khi component unmount

### 3. Keyboard shortcuts không hoạt động
- Đảm bảo component được mount
- Kiểm tra event listeners không bị conflict

## Advanced Usage

### Custom History Management
```typescript
const undoRedo = useUndoRedo(initialState);

// Clear history khi cần
undoRedo.clearHistory();

// Kiểm tra history size
console.log(undoRedo.historySize);
```

### Conditional Undo/Redo
```typescript
const handleUndo = () => {
  if (canUndo && !isSubmitting) {
    undo();
  }
};
```

## Migration từ code cũ

Nếu bạn đang sử dụng state management cũ:

1. **Thay thế useState:**
```typescript
// Cũ
const [form, setForm] = useState(initialForm);

// Mới
const { state: form, setState } = useFormUndoRedo(initialForm);
```

2. **Thay thế onChange handlers:**
```typescript
// Cũ
const handleChange = (e) => {
  setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
};

// Mới
const { updateField } = useFormUndoRedo(initialForm);
const handleChange = (e) => {
  updateField(e.target.name, e.target.value);
};
```

## Testing

### Unit Tests
```typescript
import { renderHook, act } from '@testing-library/react';
import { useUndoRedo } from '@/utils/useUndoRedo';

test('undo/redo functionality', () => {
  const { result } = renderHook(() => useUndoRedo({ value: 'initial' }));
  
  act(() => {
    result.current.setState({ value: 'changed' });
  });
  
  expect(result.current.canUndo).toBe(true);
  expect(result.current.canRedo).toBe(false);
});
```

## Performance Considerations

1. **Debouncing**: Sử dụng debounce để tránh spam history
2. **Memory limits**: Giới hạn số lượng history entries
3. **Selective tracking**: Chỉ track những thay đổi quan trọng
4. **Cleanup**: Clear history khi không cần thiết

## Browser Support

- ✅ Chrome/Chromium
- ✅ Firefox
- ✅ Safari
- ✅ Edge

## Dependencies

- React 18+
- TypeScript 4.5+
- Tailwind CSS (cho UI components)

## Contributing

Khi thêm tính năng mới cho undo/redo:

1. Maintain backward compatibility
2. Add TypeScript types
3. Update documentation
4. Add tests
5. Consider performance impact 