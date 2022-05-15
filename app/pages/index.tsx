import { Button, Card } from 'antd'
import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { useRouter } from 'next/router';
import styles from '../styles/Home.module.css'

const Home: NextPage = () => {
  const router = useRouter();

  const newRoom = () => {
    const roomId = Math.random().toString(36).slice(2, 11);
    router.push(`/rooms/${roomId}`);
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
      <Card>
        <Button type='primary' onClick={newRoom}>New Room</Button>
      </Card>
      </main>
    </div>
  )
}

export default Home
