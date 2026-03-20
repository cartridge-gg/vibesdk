import React from 'react';
import clsx from 'clsx';

export function Header({
	className,
	children,
}: React.ComponentProps<'header'>) {
	return (
		<header
			className={clsx(
				'h-13 shrink-0 w-full px-4 border-b flex items-center',
				className,
			)}
		>
			<div className="flex-1" />
			<div className="flex items-center gap-4">
				{children}
			</div>
		</header>
	);
}
