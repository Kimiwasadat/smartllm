'use client'
import {usePathname, useRouter} from 'next/navigation'

export const SearchUser = () =>  {
    const router  = useRouter()
    const pathname = usePathname()
    return (
        <div>
            <form 
            onSubmit={(e) => { 
                e.preventDefault();
                const form = e.currentTarget; 
                const formData= new FormData(form); 
                const queryTerm = formData.get('search');
                router.push(pathname +'?search='+ queryTerm) }}>
                    <label htmlFor='search'>Search for a user</label>
                    <input id="search" name="search" type="text" />
                    <button type="submit">Submit</button>
                </form>
        </div>

        
    )
}