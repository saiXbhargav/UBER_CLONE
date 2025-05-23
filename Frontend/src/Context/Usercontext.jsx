import React,{createContext, useState} from 'react'
export const UserDatacontext = createContext();

const Usercontext = ({children}) => {
  const [user,setuser]=useState({
    email:'',
    fullname:{
      firstname:'',
      lastname:''
    }
  });
  
  return (
    <div>
      <UserDatacontext.Provider value={{user,setuser}}>
        {children}
      </UserDatacontext.Provider>
    </div>
  )
}

export default Usercontext
