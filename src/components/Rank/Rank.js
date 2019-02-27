import React from 'react';

const Rank = ({name, entries}) => {
    return (
        <div>
                <div className='white f3 '>
                    {/*{'Charis your current rank is...'}*/}
                    {`${name} , your current entry count is...`}
                </div>
            <div className='white f3 '>
                {/*{'#3'}*/}
                {entries}
            </div>
        </div>
    )
}


export default Rank;

