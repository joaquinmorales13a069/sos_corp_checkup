import Link from 'next/link'
import { LuClipboardCheck, LuUserCheck, LuChevronRight } from 'react-icons/lu'

const categorias = [
  {
    href: '/dashboard/responsable/periodico',
    label: 'Periódico',
    description: 'Chequeos médicos periódicos por sucursal y año',
    icon: LuClipboardCheck,
  },
  {
    href: '/dashboard/responsable/pre-empleo',
    label: 'Pre Empleo',
    description: 'Exámenes de contratación organizados por día',
    icon: LuUserCheck,
  },
]

export default function ResponsablePage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-on-surface font-headline">
          Tipo de chequeo
        </h2>
        <p className="text-sm text-tertiary mt-1">
          Selecciona la categoría de chequeos que deseas consultar.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {categorias.map((cat) => (
          <Link
            key={cat.href}
            href={cat.href}
            className="group bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-6 flex items-center justify-between hover:shadow-md hover:border-primary/30 transition-all active:scale-[0.98]"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary-fixed flex items-center justify-center">
                <cat.icon size={28} className="text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold text-on-surface font-headline">
                  {cat.label}
                </p>
                <p className="text-xs text-tertiary font-medium mt-1 max-w-[200px]">
                  {cat.description}
                </p>
              </div>
            </div>
            <LuChevronRight
              size={20}
              className="text-tertiary group-hover:text-primary transition-colors shrink-0 ml-3"
            />
          </Link>
        ))}
      </div>
    </div>
  )
}
