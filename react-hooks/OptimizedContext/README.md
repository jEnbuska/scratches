# How to use OptimizedContext
## 1. Create optimized context
```
const TodosContext = createOptimizedContext({
    todos: [],
    addTodo(todo: Todo): void { 
        throw new Error('TodoContext used outside of TodoContextProvider')
    },
    changeTodo(todo: Todo): void { 
        throw new Error('TodoContext used outside of TodoContextProvider')
    }
})
```
## 2. Define Context.Provider using OptimizedContextProvider
```
const TodoContextProvider: ComponentType = ({children}) => {
    const [todos, setTodos] = useState<Todo[]>([]);
    
    const addTodo = useCallback((todo: Todo) => {
        setTodos((prevState) => [...prevState, todo]);
    }, [setTodos]);
    
    const changeTodo = useCallback((changedTodo: Todo) => {
        setTodos((prevState) => {
            return prevState.map(todo => todo.id === changedTodo.id ? changedTodo : todo);
        }}
    }, [setTodos])
    
    const contextValue = useMemo(() => {
        return {
            todos,
            addTodo,
            changeTodo,
        }
    }, [todos]);
    
    return (
        <OptimizedContextProvider context={TodosContext} value={contextValue}>
            {children}
        </OptimizedContextProvider>
    )
};
```

## 3. Provide OptimizedContext such as any React.Context
```
const Root: ComponentType () => {
  return (
    <TodoContextProvider>
      <TodoApp />
    </TodoContextProvider>
  )
}

ReactDOM.render(<Root />, document.getElementById('root'));
```

## 4. Consume OptimizedContext
```
const TodoList: ComponentType = (() => {
    const {todos} = useOptimizedContext(
         TodoContext, 
         (ctx) => ctx.todos.map(todo => todo.id) 
         // returning todo ids, update component on context change only when todos are re-ordered, added or removed
    );
    return todos.map(todo => {
        return (
            <TodoItem key={todo.id} id={todo.id} />
        )
    })
})

...

type TodoItemProps = {
    id: string;
};

const TodoItem = memo<TodoItemProps>(({id}) => {
    const {todos, changeTodo} = useOptimizedContext(TodoContext, 
       (ctx) => [
           ctx.todos.find(todo => todo.id === id),
           ctx.changeTodo
       ]   // returning todo and changeTodo callback, will cause the component to udpate only when these values change
    );
    const todo = todos.find(todo => todo.id);
    /* 
    ... and so on ... 
    */
})
```
