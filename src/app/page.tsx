import { Suspense } from 'react';
import CustomNav from './components/custumNav';
import List from './components/list';

// 设置数据重新验证的时间间隔
export const revalidate = 60; // 60秒重新验证一次数据


// 默认导出的页面组件，使用 async 因为内部有异步数据获取
export default async function Home() {



  return (

    <main className="p-4 max-w-7xl mx-auto">
      <CustomNav />
      {/* Suspense 用于处理异步组件的加载状态 */}
      <Suspense fallback={<p>加载中...</p>}>
        <List />
      </Suspense>
    </main>
  );
}

