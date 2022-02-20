import * as React from 'react';
import classNames from 'classnames';
import styles from './search.css';

const Search: React.FC<{
    filterQuery: string,
    inputClassName?: string,
    placeholderText?: string,
    onChange?: React.ChangeEventHandler<HTMLInputElement>,
    onClear?: React.MouseEventHandler<HTMLInputElement>,
} & React.InputHTMLAttributes<HTMLInputElement>> = props => {
    const {
        className,
        onChange,
        onClear,
        placeholderText,
        filterQuery,
        inputClassName
    } = props;
    return <div
        className={classNames(className, styles.filter, {
            [styles.isActive]: filterQuery.length > 0
        })}
    >
        <img
            className={styles.filterIcon}
            src="static/icon--filter.svg"
        />
        <input
            className={classNames(styles.filterInput, inputClassName)}
            placeholder={placeholderText || 'Search'}
            type="text"
            value={filterQuery}
            onChange={onChange}
        />
        <div
            className={styles.xIconWrapper}
            onClick={onClear}
        >
            <img
                className={styles.xIcon}
                src="static/icon--x.svg"
            />
        </div>
    </div>;
};
export default Search;
