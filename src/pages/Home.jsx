import React from 'react'
import Hero from '../components/hero';
import OurStory from '../components/ourStory';
import MenuPreview from '../components/Menu';
import './Home.css'


function Home() {
  return (
    <div>
      <Hero />
      <OurStory/>
      <MenuPreview />
    </div>
  )
}

export default Home;
