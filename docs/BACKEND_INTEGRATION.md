# Backend Integration for Undo/Redo

## Spring Boot Backend APIs

### 1. History Management APIs

```java
@RestController
@RequestMapping("/api/history")
public class HistoryController {

    @PostMapping("/save")
    public ResponseEntity<HistoryResponse> saveHistory(@RequestBody HistoryRequest request) {
        // Lưu history vào database
        return ResponseEntity.ok(historyService.saveHistory(request));
    }

    @GetMapping("/{userId}/{entityType}")
    public ResponseEntity<List<HistoryEntry>> getHistory(
        @PathVariable String userId,
        @PathVariable String entityType
    ) {
        // Lấy history từ database
        return ResponseEntity.ok(historyService.getHistory(userId, entityType));
    }

    @DeleteMapping("/{userId}/{entityType}")
    public ResponseEntity<Void> clearHistory(
        @PathVariable String userId,
        @PathVariable String entityType
    ) {
        // Xóa history
        historyService.clearHistory(userId, entityType);
        return ResponseEntity.ok().build();
    }
}
```

### 2. Database Schema

```sql
-- History table
CREATE TABLE history_entries (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(255),
    action_type VARCHAR(50) NOT NULL, -- CREATE, UPDATE, DELETE
    previous_state JSON,
    current_state JSON,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_entity (user_id, entity_type)
);

-- Auto-save table
CREATE TABLE auto_saves (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(255),
    data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_entity (user_id, entity_type, entity_id)
);
```

### 3. Entity Classes

```java
@Entity
@Table(name = "history_entries")
public class HistoryEntry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id")
    private String userId;
    
    @Column(name = "entity_type")
    private String entityType;
    
    @Column(name = "entity_id")
    private String entityId;
    
    @Column(name = "action_type")
    private String actionType;
    
    @Column(name = "previous_state", columnDefinition = "JSON")
    private String previousState;
    
    @Column(name = "current_state", columnDefinition = "JSON")
    private String currentState;
    
    @Column(name = "timestamp")
    private LocalDateTime timestamp;
    
    // Getters and setters
}

@Entity
@Table(name = "auto_saves")
public class AutoSave {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id")
    private String userId;
    
    @Column(name = "entity_type")
    private String entityType;
    
    @Column(name = "entity_id")
    private String entityId;
    
    @Column(name = "data", columnDefinition = "JSON")
    private String data;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    // Getters and setters
}
```

### 4. Service Layer

```java
@Service
public class HistoryService {
    
    @Autowired
    private HistoryRepository historyRepository;
    
    @Autowired
    private AutoSaveRepository autoSaveRepository;
    
    public HistoryResponse saveHistory(HistoryRequest request) {
        HistoryEntry entry = new HistoryEntry();
        entry.setUserId(request.getUserId());
        entry.setEntityType(request.getEntityType());
        entry.setEntityId(request.getEntityId());
        entry.setActionType(request.getActionType());
        entry.setPreviousState(request.getPreviousState());
        entry.setCurrentState(request.getCurrentState());
        entry.setTimestamp(LocalDateTime.now());
        
        historyRepository.save(entry);
        
        return new HistoryResponse(entry.getId(), "History saved successfully");
    }
    
    public List<HistoryEntry> getHistory(String userId, String entityType) {
        return historyRepository.findByUserIdAndEntityTypeOrderByTimestampDesc(userId, entityType);
    }
    
    public void clearHistory(String userId, String entityType) {
        historyRepository.deleteByUserIdAndEntityType(userId, entityType);
    }
    
    public void saveAutoSave(AutoSaveRequest request) {
        // Xóa auto-save cũ nếu có
        autoSaveRepository.deleteByUserIdAndEntityTypeAndEntityId(
            request.getUserId(), 
            request.getEntityType(), 
            request.getEntityId()
        );
        
        // Lưu auto-save mới
        AutoSave autoSave = new AutoSave();
        autoSave.setUserId(request.getUserId());
        autoSave.setEntityType(request.getEntityType());
        autoSave.setEntityId(request.getEntityId());
        autoSave.setData(request.getData());
        autoSave.setCreatedAt(LocalDateTime.now());
        
        autoSaveRepository.save(autoSave);
    }
    
    public AutoSave getAutoSave(String userId, String entityType, String entityId) {
        return autoSaveRepository.findByUserIdAndEntityTypeAndEntityId(userId, entityType, entityId);
    }
}
```

## Frontend Integration

### 1. Enhanced useUndoRedo Hook

```typescript
// src/utils/useUndoRedoWithBackend.ts
import { useUndoRedo } from './useUndoRedo';

interface BackendHistoryOptions {
  userId: string;
  entityType: string;
  entityId?: string;
  syncWithBackend?: boolean;
  autoSaveToBackend?: boolean;
}

export function useUndoRedoWithBackend<T>(
  initialState: T,
  options: BackendHistoryOptions & UseUndoRedoOptions
) {
  const {
    userId,
    entityType,
    entityId,
    syncWithBackend = true,
    autoSaveToBackend = true,
    ...undoRedoOptions
  } = options;

  const undoRedo = useUndoRedo(initialState, undoRedoOptions);

  // Sync with backend
  const syncToBackend = useCallback(async (action: 'undo' | 'redo' | 'change') => {
    if (!syncWithBackend) return;

    try {
      await fetch('/api/history/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          entityType,
          entityId,
          actionType: action,
          currentState: undoRedo.state,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Failed to sync with backend:', error);
    }
  }, [userId, entityType, entityId, syncWithBackend, undoRedo.state]);

  // Auto-save to backend
  useEffect(() => {
    if (autoSaveToBackend) {
      const saveToBackend = async () => {
        try {
          await fetch('/api/autosave/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId,
              entityType,
              entityId,
              data: undoRedo.state
            })
          });
        } catch (error) {
          console.error('Failed to auto-save to backend:', error);
        }
      };

      const timeoutId = setTimeout(saveToBackend, 2000); // Auto-save after 2 seconds
      return () => clearTimeout(timeoutId);
    }
  }, [undoRedo.state, userId, entityType, entityId, autoSaveToBackend]);

  // Load history from backend
  const loadHistoryFromBackend = useCallback(async () => {
    if (!syncWithBackend) return;

    try {
      const response = await fetch(`/api/history/${userId}/${entityType}`);
      const history = await response.json();
      
      // Apply history to local state
      // Implementation depends on your needs
    } catch (error) {
      console.error('Failed to load history from backend:', error);
    }
  }, [userId, entityType, syncWithBackend]);

  // Enhanced undo/redo with backend sync
  const enhancedUndo = useCallback(() => {
    undoRedo.undo();
    syncToBackend('undo');
  }, [undoRedo.undo, syncToBackend]);

  const enhancedRedo = useCallback(() => {
    undoRedo.redo();
    syncToBackend('redo');
  }, [undoRedo.redo, syncToBackend]);

  return {
    ...undoRedo,
    undo: enhancedUndo,
    redo: enhancedRedo,
    loadHistoryFromBackend,
    syncToBackend
  };
}
```

### 2. Questions Form with Backend Integration

```typescript
// src/components/Questions/QuestionFormWithBackendUndoRedo.tsx
import React from 'react';
import { useUndoRedoWithBackend } from '@/utils/useUndoRedoWithBackend';
import QuestionForm from './QuestionForm';
import UndoRedoControls from '@/components/Common/UndoRedoControls';

interface QuestionFormWithBackendUndoRedoProps {
  form: {
    content: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctAnswer: string;
    explanation: string;
    level: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  submitting: boolean;
  onCancel: () => void;
  isEdit?: boolean;
  userId: string;
  questionId?: string;
}

const QuestionFormWithBackendUndoRedo: React.FC<QuestionFormWithBackendUndoRedoProps> = ({
  form,
  onChange,
  onSubmit,
  submitting,
  onCancel,
  isEdit,
  userId,
  questionId
}) => {
  const {
    state: undoRedoForm,
    canUndo,
    canRedo,
    undo,
    redo,
    updateField,
    clearHistory,
    loadHistoryFromBackend
  } = useUndoRedoWithBackend(form, {
    maxHistory: 20,
    debounceMs: 500,
    autoSave: true,
    userId,
    entityType: 'question',
    entityId: questionId,
    syncWithBackend: true,
    autoSaveToBackend: true
  });

  // Load history when component mounts
  React.useEffect(() => {
    if (isEdit && questionId) {
      loadHistoryFromBackend();
    }
  }, [isEdit, questionId, loadHistoryFromBackend]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    updateField(name as keyof typeof form, value);
    onChange(e);
  };

  const handleCancel = () => {
    clearHistory();
    onCancel();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border">
        <div className="text-sm text-gray-600">
          <span className="font-medium">Form History:</span> 
          <span className="ml-2 text-xs">
            {canUndo ? `${undoRedoForm.historySize} changes` : 'No changes'}
          </span>
          <span className="ml-2 text-xs text-green-600">✓ Synced with server</span>
        </div>
        <UndoRedoControls
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={undo}
          onRedo={redo}
          showKeyboardShortcuts={true}
        />
      </div>
      
      <QuestionForm
        form={undoRedoForm}
        onChange={handleChange}
        onSubmit={onSubmit}
        submitting={submitting}
        onCancel={handleCancel}
        isEdit={isEdit}
        showUndoRedo={false}
      />
    </div>
  );
};

export default QuestionFormWithBackendUndoRedo;
```

### 3. API Integration

```typescript
// src/app/api/libApi/historyApi.ts
export const historyApi = {
  // Save history entry
  saveHistory: async (data: {
    userId: string;
    entityType: string;
    entityId?: string;
    actionType: string;
    currentState: any;
    timestamp: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/history/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  // Get history
  getHistory: async (userId: string, entityType: string) => {
    const response = await fetch(`${API_BASE_URL}/history/${userId}/${entityType}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.json();
  },

  // Clear history
  clearHistory: async (userId: string, entityType: string) => {
    await fetch(`${API_BASE_URL}/history/${userId}/${entityType}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
  },

  // Auto-save
  saveAutoSave: async (data: {
    userId: string;
    entityType: string;
    entityId?: string;
    data: any;
  }) => {
    const response = await fetch(`${API_BASE_URL}/autosave/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  // Get auto-save
  getAutoSave: async (userId: string, entityType: string, entityId?: string) => {
    const response = await fetch(`${API_BASE_URL}/autosave/${userId}/${entityType}/${entityId || 'new'}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.json();
  }
};
```

## Benefits of Backend Integration

### 1. **Persistent History**
- History được lưu trong database
- Không mất khi refresh page
- Có thể sync giữa nhiều devices

### 2. **Collaborative Features**
- Multiple users có thể thấy history của nhau
- Conflict resolution
- Real-time sync

### 3. **Advanced Analytics**
- Track user behavior
- Performance metrics
- Usage statistics

### 4. **Recovery Features**
- Auto-save recovery
- Disaster recovery
- Version control

## Implementation Steps

1. **Backend**: Implement Spring Boot APIs
2. **Database**: Create history and auto-save tables
3. **Frontend**: Update hooks to sync with backend
4. **Testing**: Test sync functionality
5. **Deployment**: Deploy with proper error handling

## Security Considerations

- Validate user permissions
- Sanitize data before saving
- Implement rate limiting
- Add audit logging
- Encrypt sensitive data 