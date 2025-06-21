import { useState, useCallback, useRef, useEffect } from 'react';
// import { useTranslation } from '../contexts/I18nContext'; // Unused

export interface UndoRedoAction<T = any> {
  id: string;
  type: string;
  description: string;
  timestamp: number;
  undo: () => void | Promise<void>;
  redo: () => void | Promise<void>;
  data?: T;
  groupId?: string;
}

export interface UndoRedoState {
  undoStack: UndoRedoAction[];
  redoStack: UndoRedoAction[];
  currentGroupId?: string;
  maxStackSize: number;
}

export interface UndoRedoOptions {
  maxStackSize?: number;
  enableKeyboardShortcuts?: boolean;
  groupingTimeout?: number;
  persistState?: boolean;
  storageKey?: string;
}

export interface UndoRedoReturn<T> {
  execute: (action: Omit<UndoRedoAction<T>, 'timestamp'>) => UndoRedoAction<T>;
  undo: () => Promise<boolean>;
  redo: () => Promise<boolean>;
  clear: () => void;
  getHistory: () => { undoActions: UndoRedoAction[]; redoActions: UndoRedoAction[] };
  canUndo: boolean;
  canRedo: boolean;
  nextUndoAction?: UndoRedoAction;
  nextRedoAction?: UndoRedoAction;
  undoStack: UndoRedoAction[];
  redoStack: UndoRedoAction[];
}

export function useUndoRedo<T>(
  initialState: T,
  options: UndoRedoOptions = {}
): UndoRedoReturn<T> {
  const { maxStackSize = 50, enableKeyboardShortcuts = true } = options;
  // const [state, setState] = useState<T>(initialState); // Unused

  // const { t: _ } = useTranslation(); // Currently unused
  const groupTimeoutRef = useRef<NodeJS.Timeout>();
  const lastActionTimestamp = useRef<number>(0);

  // Initialize state
  const [undoRedoState, setUndoRedoState] = useState<UndoRedoState>(() => {
    if (options.persistState && typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(options.storageKey || 'undo-redo-state');
        if (saved) {
          const parsed = JSON.parse(saved);
          return {
            undoStack: parsed.undoStack || [],
            redoStack: parsed.redoStack || [],
            maxStackSize
          };
        }
      } catch (error) {
        console.warn('Failed to load undo/redo state:', error);
      }
    }
    
    return {
      undoStack: [],
      redoStack: [],
      maxStackSize
    };
  });

  // Persist state to localStorage
  useEffect(() => {
    if (options.persistState && typeof window !== 'undefined') {
      try {
        localStorage.setItem(options.storageKey || 'undo-redo-state', JSON.stringify({
          undoStack: undoRedoState.undoStack,
          redoStack: undoRedoState.redoStack
        }));
      } catch (error) {
        console.warn('Failed to persist undo/redo state:', error);
      }
    }
  }, [undoRedoState, options.persistState, options.storageKey]);

  // Add action to undo stack
  const execute = useCallback((action: Omit<UndoRedoAction<T>, 'timestamp'>) => {
    const now = Date.now();
    const fullAction: UndoRedoAction<T> = {
      ...action,
      timestamp: now
    };

    setUndoRedoState(prevState => {
      let newUndoStack = [...prevState.undoStack];
      
      // Check if this action should be grouped with the previous one
      const shouldGroup = action.groupId && 
                         action.groupId === prevState.currentGroupId &&
                         (now - lastActionTimestamp.current < (options.groupingTimeout || 1000));

      if (shouldGroup && newUndoStack.length > 0) {
        // Replace the last action if it's part of the same group
        const lastAction = newUndoStack[newUndoStack.length - 1];
        if (lastAction.groupId === action.groupId) {
          newUndoStack[newUndoStack.length - 1] = fullAction;
        } else {
          newUndoStack.push(fullAction);
        }
      } else {
        newUndoStack.push(fullAction);
      }

      // Limit stack size
      if (newUndoStack.length > maxStackSize) {
        newUndoStack = newUndoStack.slice(-maxStackSize);
      }

      return {
        ...prevState,
        undoStack: newUndoStack,
        redoStack: [], // Clear redo stack when new action is executed
        currentGroupId: action.groupId
      };
    });

    lastActionTimestamp.current = now;

    // Clear group timeout and set new one if groupId is provided
    if (groupTimeoutRef.current) {
      clearTimeout(groupTimeoutRef.current);
    }
    
    if (action.groupId) {
      groupTimeoutRef.current = setTimeout(() => {
        setUndoRedoState(prev => ({ ...prev, currentGroupId: undefined }));
      }, options.groupingTimeout || 1000);
    }

    return fullAction;
  }, [maxStackSize, options.groupingTimeout]);

  // Undo the last action
  const undo = useCallback(async () => {
    if (undoRedoState.undoStack.length === 0) return false;

    const action = undoRedoState.undoStack[undoRedoState.undoStack.length - 1];
    
    try {
      await action.undo();
      
      setUndoRedoState(prevState => ({
        ...prevState,
        undoStack: prevState.undoStack.slice(0, -1),
        redoStack: [...prevState.redoStack, action]
      }));
      
      return true;
    } catch (error) {
      console.error('Undo failed:', error);
      return false;
    }
  }, [undoRedoState.undoStack]);

  // Redo the last undone action
  const redo = useCallback(async () => {
    if (undoRedoState.redoStack.length === 0) return false;

    const action = undoRedoState.redoStack[undoRedoState.redoStack.length - 1];
    
    try {
      await action.redo();
      
      setUndoRedoState(prevState => ({
        ...prevState,
        undoStack: [...prevState.undoStack, action],
        redoStack: prevState.redoStack.slice(0, -1)
      }));
      
      return true;
    } catch (error) {
      console.error('Redo failed:', error);
      return false;
    }
  }, [undoRedoState.redoStack]);

  // Clear all undo/redo history
  const clear = useCallback(() => {
    setUndoRedoState(prevState => ({
      ...prevState,
      undoStack: [],
      redoStack: [],
      currentGroupId: undefined
    }));
  }, []);

  // Get history for UI display
  const getHistory = useCallback(() => {
    return {
      undoActions: [...undoRedoState.undoStack].reverse(),
      redoActions: [...undoRedoState.redoStack].reverse()
    };
  }, [undoRedoState]);

  // Check if undo/redo is possible
  const canUndo = undoRedoState.undoStack.length > 0;
  const canRedo = undoRedoState.redoStack.length > 0;

  // Get description of next undo/redo action
  const nextUndoAction = undoRedoState.undoStack[undoRedoState.undoStack.length - 1];
  const nextRedoAction = undoRedoState.redoStack[undoRedoState.redoStack.length - 1];

  // Keyboard shortcuts
  useEffect(() => {
    if (!enableKeyboardShortcuts) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const { key, ctrlKey, metaKey, shiftKey } = event;
      
      if (ctrlKey || metaKey) {
        if (key === 'z' && !shiftKey) {
          event.preventDefault();
          undo();
        } else if ((key === 'z' && shiftKey) || key === 'y') {
          event.preventDefault();
          redo();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enableKeyboardShortcuts, undo, redo]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (groupTimeoutRef.current) {
        clearTimeout(groupTimeoutRef.current);
      }
    };
  }, []);

  return {
    execute,
    undo,
    redo,
    clear,
    getHistory,
    canUndo,
    canRedo,
    nextUndoAction,
    nextRedoAction,
    undoStack: undoRedoState.undoStack,
    redoStack: undoRedoState.redoStack
  };
}

// Helper functions for common undo/redo patterns

// Text editing undo/redo
export function useTextUndoRedo(
  value: string,
  onChange: (value: string) => void,
  options: UndoRedoOptions = {}
) {
  const undoRedo = useUndoRedo<{ oldValue: string; newValue: string }>({ oldValue: '', newValue: '' }, options);
  const previousValue = useRef(value);

  const setValue = useCallback((newValue: string, description?: string) => {
    const oldValue = previousValue.current;
    
    if (oldValue === newValue) return;

    const action = undoRedo.execute({
      id: `text-change-${Date.now()}`,
      type: 'text-change',
      description: description || 'Text change',
      data: { oldValue, newValue },
      undo: () => {
        onChange(oldValue);
        previousValue.current = oldValue;
      },
      redo: () => {
        onChange(newValue);
        previousValue.current = newValue;
      },
      groupId: 'text-editing'
    });

    onChange(newValue);
    previousValue.current = newValue;
    
    return action;
  }, [onChange, undoRedo]);

  // Update previousValue when value changes externally
  useEffect(() => {
    previousValue.current = value;
  }, [value]);

  return {
    setValue,
    ...undoRedo
  };
}

// Form data undo/redo
export function useFormUndoRedo<T extends Record<string, any>>(
  initialData: T,
  options: UndoRedoOptions = {}
) {
  const [formData, setFormData] = useState<T>(initialData);
  const undoRedo = useUndoRedo<{ field?: keyof T; oldValue: any; newValue: any }>({ oldValue: null, newValue: null }, options);

  const updateField = useCallback((field: keyof T, newValue: any, description?: string) => {
    const oldValue = formData[field];
    
    if (oldValue === newValue) return;

    const action = undoRedo.execute({
      id: `form-change-${field.toString()}-${Date.now()}`,
      type: 'form-field-change',
      description: description || `Update ${field.toString()}`,
      data: { field, oldValue, newValue },
      undo: () => {
        setFormData(prev => ({ ...prev, [field]: oldValue }));
      },
      redo: () => {
        setFormData(prev => ({ ...prev, [field]: newValue }));
      },
      groupId: `form-${field.toString()}`
    });

    setFormData(prev => ({ ...prev, [field]: newValue }));
    return action;
  }, [formData, undoRedo]);

  const resetForm = useCallback(() => {
    const action = undoRedo.execute({
      id: `form-reset-${Date.now()}`,
      type: 'form-reset',
      description: 'Reset form',
      data: { oldValue: formData, newValue: initialData },
      undo: () => setFormData(formData),
      redo: () => setFormData(initialData)
    });

    setFormData(initialData);
    return action;
  }, [formData, initialData, undoRedo]);

  return {
    formData,
    updateField,
    resetForm,
    setFormData,
    ...undoRedo
  };
}

// Array manipulation undo/redo
export function useArrayUndoRedo<T>(
  initialArray: T[],
  options: UndoRedoOptions = {}
) {
  const [array, setArray] = useState<T[]>(initialArray);
  const undoRedo = useUndoRedo<{ oldArray: T[]; newArray: T[] }>({ oldArray: [], newArray: [] }, options);

  const push = useCallback((item: T, description?: string) => {
    const oldArray = [...array];
    const newArray = [...array, item];

    const action = undoRedo.execute({
      id: `array-push-${Date.now()}`,
      type: 'array-push',
      description: description || 'Add item',
      data: { oldArray, newArray },
      undo: () => setArray(oldArray),
      redo: () => setArray(newArray)
    });

    setArray(newArray);
    return action;
  }, [array, undoRedo]);

  const remove = useCallback((index: number, description?: string) => {
    if (index < 0 || index >= array.length) return;

    const oldArray = [...array];
    const newArray = array.filter((_, i) => i !== index);

    const action = undoRedo.execute({
      id: `array-remove-${Date.now()}`,
      type: 'array-remove',
      description: description || 'Remove item',
      data: { oldArray, newArray },
      undo: () => setArray(oldArray),
      redo: () => setArray(newArray)
    });

    setArray(newArray);
    return action;
  }, [array, undoRedo]);

  const update = useCallback((index: number, newItem: T, description?: string) => {
    if (index < 0 || index >= array.length) return;

    const oldArray = [...array];
    const newArray = array.map((item, i) => i === index ? newItem : item);

    const action = undoRedo.execute({
      id: `array-update-${Date.now()}`,
      type: 'array-update',
      description: description || 'Update item',
      data: { oldArray, newArray },
      undo: () => setArray(oldArray),
      redo: () => setArray(newArray)
    });

    setArray(newArray);
    return action;
  }, [array, undoRedo]);

  const move = useCallback((fromIndex: number, toIndex: number, description?: string) => {
    if (fromIndex === toIndex || fromIndex < 0 || fromIndex >= array.length || 
        toIndex < 0 || toIndex >= array.length) return;

    const oldArray = [...array];
    const newArray = [...array];
    const [movedItem] = newArray.splice(fromIndex, 1);
    newArray.splice(toIndex, 0, movedItem);

    const action = undoRedo.execute({
      id: `array-move-${Date.now()}`,
      type: 'array-move',
      description: description || 'Move item',
      data: { oldArray, newArray },
      undo: () => setArray(oldArray),
      redo: () => setArray(newArray)
    });

    setArray(newArray);
    return action;
  }, [array, undoRedo]);

  return {
    array,
    push,
    remove,
    update,
    move,
    setArray,
    ...undoRedo
  };
} 