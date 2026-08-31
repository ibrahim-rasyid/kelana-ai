import styles from "./FormCard.module.css";

interface FormCardProps {
    title: string;
    subtitle: string;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    children: React.ReactNode;
    submitLabel: string;
    loadingLabel: string;
    loading: boolean;
    error: string | null;
}

export function FormCard({
    title,
    subtitle,
    onSubmit,
    children,
    submitLabel,
    loadingLabel,
    loading,
    error,
}: FormCardProps) {
    return (
        <div className={styles.container}>
            {loading ? (
                <div className={styles.loadingOverlay}>
                    <div className={styles.spinner}></div>
                    <p className={styles.loadingText}>{loadingLabel}</p>
                </div>
            ) : (
                <div className={styles.formCard}>
                    <h1 className={styles.title}>{title}</h1>
                    <p className={styles.subtitle}>{subtitle}</p>

                    <form onSubmit={onSubmit} className={styles.form}>
                        {children}

                        <button type="submit" className={styles.button} disabled={loading}>
                            {submitLabel}
                        </button>
                    </form>

                    {error && <div className={styles.error}>Error: {error}</div>}
                </div>
            )}
        </div>
    );
}
