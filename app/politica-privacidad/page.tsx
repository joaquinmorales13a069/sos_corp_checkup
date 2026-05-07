import { LuShieldCheck } from 'react-icons/lu'

export const metadata = {
  title: 'Política de Privacidad — SOS Medical',
  robots: { index: false },
}

export default function PoliticaPrivacidadPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Page header */}
      <div className="pb-6 border-b border-outline-variant/30">
        <span className="inline-block bg-secondary text-on-secondary text-[11px] font-semibold px-3 py-1 rounded-md uppercase tracking-wide mb-3">
          Política de Privacidad
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-on-surface font-headline leading-tight">
          Política de Privacidad y Protección de Datos
        </h1>
        <p className="text-sm text-on-surface-variant mt-2">
          Última actualización: Mayo 2026 · SOS Medical Nicaragua
        </p>
      </div>

      {/* Section 1 */}
      <div className="bg-surface-container-lowest border border-surface-container-high rounded-xl p-5 space-y-2">
        <h2 className="text-base font-semibold text-primary">
          1. Responsable del tratamiento
        </h2>
        <p className="text-sm text-on-surface-variant leading-relaxed">
          <strong className="text-on-surface">SOS Medical Nicaragua</strong> es el responsable del tratamiento de los datos personales gestionados a través de este sistema. Para consultas relacionadas con el tratamiento de sus datos, puede contactarnos en{' '}
          <a
            href="mailto:desarrollo@sosmedical.com.ni"
            className="text-primary underline hover:text-primary-container transition-colors"
          >
            desarrollo@sosmedical.com.ni
          </a>
          .
        </p>
      </div>

      {/* Section 2 */}
      <div className="bg-surface-container-lowest border border-surface-container-high rounded-xl p-5 space-y-2">
        <h2 className="text-base font-semibold text-primary">
          2. Datos que procesamos
        </h2>
        <p className="text-sm text-on-surface-variant leading-relaxed">
          A través de este sistema gestionamos los siguientes tipos de datos:
        </p>
        <ul className="text-sm text-on-surface-variant leading-relaxed list-disc list-inside space-y-1 pl-2">
          <li>Vínculos de acceso a expedientes de chequeo médico almacenados en plataforma de almacenamiento en la nube.</li>
          <li>Datos de identificación del responsable de chequeo: nombre, correo electrónico y rol en el sistema.</li>
          <li>Registros de acceso al sistema: fecha, hora y tipo de acción realizada.</li>
        </ul>
      </div>

      {/* Section 3 */}
      <div className="bg-surface-container-lowest border border-surface-container-high rounded-xl p-5 space-y-2">
        <h2 className="text-base font-semibold text-primary">
          3. Finalidad del tratamiento
        </h2>
        <p className="text-sm text-on-surface-variant leading-relaxed">
          Los datos son procesados exclusivamente para la <strong className="text-on-surface">gestión de chequeos médicos empresariales</strong> y la entrega de resultados a los responsables designados por cada empresa cliente.
        </p>
      </div>

      {/* Section 4 */}
      <div className="bg-surface-container-lowest border border-surface-container-high rounded-xl p-5 space-y-2">
        <h2 className="text-base font-semibold text-primary">
          4. Base legal
        </h2>
        <p className="text-sm text-on-surface-variant leading-relaxed">
          El tratamiento de datos se sustenta en la relación contractual entre SOS Medical y las empresas cliente para la prestación del servicio de gestión de chequeos médicos empresariales.
        </p>
      </div>

      {/* Section 5 */}
      <div className="bg-surface-container-lowest border border-surface-container-high rounded-xl p-5 space-y-2">
        <h2 className="text-base font-semibold text-primary">
          5. Flujo de datos
        </h2>
        <p className="text-sm text-on-surface-variant leading-relaxed">
          El recorrido de los datos dentro del sistema es el siguiente:
        </p>
        <ol className="text-sm text-on-surface-variant leading-relaxed list-decimal list-inside space-y-1 pl-2">
          <li><strong className="text-on-surface">Administrador SOS Medical</strong> — registra empresas, sucursales y vínculos a expedientes de chequeo médico almacenados externamente.</li>
          <li><strong className="text-on-surface">Responsable de empresa</strong> — accede al sistema para consultar los vínculos a los expedientes de chequeo de su empresa asignada.</li>
        </ol>
      </div>

      {/* Section 6 */}
      <div className="bg-surface-container-lowest border border-surface-container-high rounded-xl p-5 space-y-2">
        <h2 className="text-base font-semibold text-primary">
          6. Derechos de los titulares
        </h2>
        <p className="text-sm text-on-surface-variant leading-relaxed">
          Los titulares de los datos tienen derecho a solicitar: acceso, rectificación, supresión, oposición, portabilidad y limitación del tratamiento de sus datos personales. Para ejercer estos derechos, puede contactarnos en{' '}
          <a
            href="mailto:desarrollo@sosmedical.com.ni"
            className="text-primary underline hover:text-primary-container transition-colors"
          >
            desarrollo@sosmedical.com.ni
          </a>
          .
        </p>
      </div>

      {/* Section 7 */}
      <div className="bg-surface-container-lowest border border-surface-container-high rounded-xl p-5 space-y-2">
        <h2 className="text-base font-semibold text-primary">
          7. Retención de datos
        </h2>
        <p className="text-sm text-on-surface-variant leading-relaxed">
          Los datos personales serán conservados durante el tiempo que dure la relación contractual entre SOS Medical y la empresa cliente, más el período de retención legal aplicable según la normativa vigente en Nicaragua.
        </p>
      </div>

      {/* Section 8 — ISO 27001 (highlighted) */}
      <div className="bg-primary-fixed border border-primary/20 rounded-xl p-5 flex gap-4 items-start">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
          <LuShieldCheck size={20} className="text-on-primary" />
        </div>
        <div className="space-y-2">
          <h2 className="text-base font-semibold text-primary">
            8. Seguridad de la información
          </h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Este sistema fue desarrollado siguiendo las directrices de la norma{' '}
            <strong className="text-on-surface">ISO 27001</strong>, con el objetivo de garantizar la confidencialidad, integridad y disponibilidad de la información médica gestionada.
          </p>
        </div>
      </div>

      {/* Section 9 */}
      <div className="bg-surface-container-lowest border border-surface-container-high rounded-xl p-5 space-y-2">
        <h2 className="text-base font-semibold text-primary">
          9. Contacto
        </h2>
        <p className="text-sm text-on-surface-variant leading-relaxed">
          Para consultas relacionadas con el tratamiento de sus datos personales, puede contactar a SOS Medical en:{' '}
          <a
            href="mailto:desarrollo@sosmedical.com.ni"
            className="text-primary underline hover:text-primary-container transition-colors"
          >
            desarrollo@sosmedical.com.ni
          </a>
          .
        </p>
      </div>
    </div>
  )
}
