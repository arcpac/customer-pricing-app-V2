import { Button } from '@/components/ui/button'
import { useState } from 'react'

const ReactCorePage = () => {
    const [count, setCount] = useState<number>(0)

    const increaseCount = () => {
        setCount((prevcount) => prevcount + 1)
        console.log('inside count: ', count)
    }
    console.log('outside count: ', count)

    return (
        <div className='flex'>
            <div>
                count: {count}
            </div>

            <Button className='bg-green-600 text-white' size="sm" onClick={increaseCount}>
                Increase count
            </Button>
        </div>
    )
}

export default ReactCorePage