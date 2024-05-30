import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <section className='page notfound'>
      <div className="content">
        <img src="/PageNotFound.jpg" className='notfoundimg' alt="Page Not Found" />
        <Link ro={"/"}>Return To Home</Link>
      </div>
    </section>
  )
}

export default NotFound
