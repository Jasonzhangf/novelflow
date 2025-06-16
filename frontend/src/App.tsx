import EditorWithProvider from './components/Editor';
import './App.css';

function App() {
  return (
    <>
      {/* Tailwind red border test 红色边框测试 */}
      <div className="border-4 border-red-500 m-4 p-2">红色边框测试 Red Border Test</div>
      <EditorWithProvider />
    </>
  )
}

export default App
