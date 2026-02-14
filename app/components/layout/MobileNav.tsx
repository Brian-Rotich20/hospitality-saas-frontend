'use client';

type MobileNavProps = {
    role: 'customer' | 'vendor' | 'admin';
}
export  function MobileNav (role: MobileNavProps){
    return (
        <div>
            <h2>Mobile Nav Bar</h2>
        </div>
    );
}