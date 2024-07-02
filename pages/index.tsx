import { useRouter } from 'next/router';
import Main from '@/pages/components/Main';
import MainNavbar from '@/pages/components/MainNavbar';
import A12 from './components/a12';

const Index = () => {

  const router = useRouter();

  return (
    <>
      <A12 />
      <Main />
    </>
  );
}

export default Index;