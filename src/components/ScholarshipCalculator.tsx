import React, { useEffect, useMemo, useState } from "react";
import costosFlatRulesData from "../data/costos_2026_flat_rules.json";
import costosMetaData from "../data/costos_2026_meta.json";

type Nivel = "licenciatura" | "salud" | "maestria" | "preparatoria";
type Modalidad = "presencial" | "online" | "mixta";
type Tier = "T1" | "T2" | "T3";
type Programa = "nuevo" | "regreso";
type ProgramaDataKey = "nuevo_ingreso" | "reingreso";
type UniversityKey = "unidep";

interface RangoPromedio {
  min: number;
  max: number;
}

interface CostoRule {
  nivel: Nivel;
  modalidad: Modalidad;
  plan: number;
  tier?: Tier | null;
  rango: RangoPromedio;
  porcentaje: number;
  monto: number;
  programa: ProgramaDataKey;
  origen?: string;
}

interface CargoItem {
  codigo: string;
  concepto: string;
  costo: number;
}

interface PlantelOfertaItem {
  neto: number;
  becas: Record<string, number>;
}

interface PlantelMeta {
  tier: Tier | null;
  oferta: Partial<Record<Nivel, Record<string, PlantelOfertaItem>>>;
  cargos?: Record<string, CargoItem[]>;
}

interface CostosMeta {
  version: string;
  planteles_por_nivel_y_modalidad: Record<string, string[]>;
  planteles: Record<string, PlantelMeta>;
}

const COSTOS_RULES: CostoRule[] = costosFlatRulesData as CostoRule[];
const COSTOS_META: CostosMeta = costosMetaData as CostosMeta;

const resolveProgramaKey = (p: Programa): ProgramaDataKey =>
  p === "regreso" ? "reingreso" : "nuevo_ingreso";

interface ScholarshipCalculatorProps {
  university?: UniversityKey;
}

interface SearchableSelectProps {
  id: string;
  openId: string | null;
  setOpenId: (id: string | null) => void;
  label: string;
  placeholder?: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  accent?: "emerald" | "violet";
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  id,
  openId,
  setOpenId,
  label,
  placeholder = "Selecciona una opción",
  options,
  value,
  onChange,
  disabled,
  accent = "emerald",
}) => {
  const [query, setQuery] = useState("");
  const open = openId === id;
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const filteredOptions = useMemo(() => {
    const q = query.toLowerCase();
    return options.filter((opt) => opt.toLowerCase().includes(q));
  }, [options, query]);

  const selectedLabel = value || placeholder;

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenId(null);
      }
    };

    const onPointerDown = (event: MouseEvent | PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (!containerRef.current) return;
      if (!containerRef.current.contains(target)) {
        setOpenId(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open, setOpenId]);

  return (
    <div className="space-y-1 [@media(max-height:700px)]:space-y-0">
      <label className="block text-xs font-medium text-slate-300 uppercase tracking-wide">
        {label}
      </label>
      <div ref={containerRef} className="relative">
        <button
          type="button"
          className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 ${
            accent === "violet"
              ? "focus:ring-violet-400/70"
              : "focus:ring-emerald-400/70"
          }
            ${
              disabled
                ? "cursor-not-allowed border-slate-700 bg-slate-800/60 text-slate-500"
                : "border-slate-700 bg-slate-900/60 hover:border-slate-500"
            }
          `}
          onClick={() => {
            if (disabled) return;
            setOpenId(open ? null : id);
          }}
        >
          <span className={value ? "text-slate-50" : "text-slate-500"}>
            {selectedLabel}
          </span>
          <svg
            className={`h-4 w-4 text-slate-400 transition-transform ${
              open ? "rotate-180" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              d="M6 9l6 6 6-6"
            />
          </svg>
        </button>

        {open && !disabled && (
          <div className="absolute z-20 mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 shadow-xl recalc-pop">
            {options.length > 6 && (
              <div className="border-b border-slate-800 p-2">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar..."
                  className={`w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 ${
                    accent === "violet"
                      ? "focus:border-violet-400 focus:ring-violet-400"
                      : "focus:border-emerald-400 focus:ring-emerald-400"
                  }`}
                />
              </div>
            )}
            <ul className="max-h-60 overflow-y-auto py-1 text-sm">
              {filteredOptions.length === 0 && (
                <li className="px-3 py-2 text-xs text-slate-500">
                  Sin resultados
                </li>
              )}
              {filteredOptions.map((opt) => (
                <li key={opt}>
                  <button
                    type="button"
                    className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-slate-800/80 ${
                      opt === value
                        ? accent === "violet"
                          ? "text-violet-300"
                          : "text-emerald-300"
                        : "text-slate-100"
                    }`}
                    onClick={() => {
                      onChange(opt);
                      setOpenId(null);
                      setQuery("");
                    }}
                  >
                    <span>{opt}</span>
                    {opt === value && (
                      <span
                        className={`text-[10px] uppercase tracking-wide ${
                          accent === "violet"
                            ? "text-violet-400"
                            : "text-emerald-400"
                        }`}
                      >
                        seleccionado
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

const ScholarshipCalculator: React.FC<ScholarshipCalculatorProps> = ({
  university = "unidep",
}) => {
  const [programa, setPrograma] = useState<Programa>("nuevo");
  const [nivel, setNivel] = useState<Nivel | "">("");
  const [modalidad, setModalidad] = useState<Modalidad | "">("");
  const [plan, setPlan] = useState<number | "">("");
  const [plantel, setPlantel] = useState<string>("");
  const [promedio, setPromedio] = useState<string>("");

  const [resultadoMonto, setResultadoMonto] = useState<number | null>(null);
  const [resultadoPorcentaje, setResultadoPorcentaje] = useState<number | null>(
    null
  );
  const [precioLista, setPrecioLista] = useState<number | null>(null);
  const [error, setError] = useState<string>("");

  const isRegreso = programa === "regreso";
  const accent = isRegreso ? "violet" : "emerald";

  const [extrasActivos, setExtrasActivos] = useState(false);
  const [extrasAbiertos, setExtrasAbiertos] = useState(false);
  const [extrasSeleccionados, setExtrasSeleccionados] = useState<string[]>([]);
  const [openSelectId, setOpenSelectId] = useState<string | null>(null);

  const requierePlantel = useMemo(() => {
    if (!nivel || !modalidad) return false;
    return (
      (nivel === "licenciatura" ||
        nivel === "salud" ||
        nivel === "preparatoria") &&
      modalidad !== "online"
    );
  }, [nivel, modalidad]);

  const plantelResolvido = useMemo(() => {
    if (!nivel || !modalidad) return "";
    if (modalidad === "online") return "ONLINE";
    return requierePlantel ? plantel : "";
  }, [nivel, modalidad, requierePlantel, plantel]);

  const tierResolvido = useMemo((): Tier | undefined => {
    if (!requierePlantel) return undefined;
    if (!plantelResolvido) return undefined;
    const tier = COSTOS_META.planteles?.[plantelResolvido]?.tier ?? null;
    return tier ?? undefined;
  }, [requierePlantel, plantelResolvido]);

  const nivelesDisponibles = useMemo(() => {
    const set = new Set<Nivel>();
    COSTOS_RULES.forEach((c) => set.add(c.nivel));
    return Array.from(set).sort();
  }, []);

  const modalidadesDisponibles = useMemo(() => {
    if (!nivel) return [];
    const set = new Set<Modalidad>();
    COSTOS_RULES.filter((c) => c.nivel === nivel)
      .forEach((c) => set.add(c.modalidad));
    const modalidades = Array.from(set);
    const filtradas =
      nivel === "salud"
        ? modalidades.filter((m) => m !== "mixta")
        : modalidades;
    const orden: Modalidad[] = ["presencial", "mixta", "online"];
    return filtradas.sort((a, b) => orden.indexOf(a) - orden.indexOf(b));
  }, [nivel]);

  const planesDisponibles = useMemo(() => {
    if (!nivel || !modalidad) return [];
    const set = new Set<number>();
    COSTOS_RULES.filter((c) => c.nivel === nivel && c.modalidad === modalidad)
      .forEach((c) => set.add(c.plan));
    return Array.from(set).sort((a, b) => a - b);
  }, [nivel, modalidad]);

  const plantelesDisponibles = useMemo(() => {
    if (!requierePlantel) {
      return [];
    }

    const key =
      nivel === "licenciatura"
        ? "licenciatura_presencial_mixta"
        : nivel === "salud"
          ? "salud_presencial"
          : "preparatoria_presencial_mixta";

    const lista = COSTOS_META.planteles_por_nivel_y_modalidad?.[key] ?? [];
    return [...lista].sort((a, b) => a.localeCompare(b, "es"));
  }, [nivel, requierePlantel]);

  const extrasDisponibles = useMemo(() => {
    if (!plantelResolvido) return null;
    return COSTOS_META.planteles?.[plantelResolvido]?.cargos ?? null;
  }, [plantelResolvido]);

  const extrasTotal = useMemo(() => {
    if (!isRegreso || !extrasActivos || !extrasDisponibles) return 0;
    const selected = new Set(extrasSeleccionados);
    let total = 0;
    Object.values(extrasDisponibles).forEach((items) => {
      items.forEach((item) => {
        if (selected.has(item.codigo)) total += item.costo;
      });
    });
    return Math.round(total * 100) / 100;
  }, [extrasActivos, extrasDisponibles, extrasSeleccionados, isRegreso]);

  useEffect(() => {
    if (!nivel || !modalidad || !plan) {
      setPrecioLista(null);
      return;
    }

    if (requierePlantel && !plantel) {
      setPrecioLista(null);
      return;
    }

    const plantelKey = modalidad === "online" ? "ONLINE" : plantel;
    const oferta =
      plantelKey && COSTOS_META.planteles?.[plantelKey]?.oferta?.[nivel]?.[
        String(plan)
      ];

    if (typeof oferta?.neto === "number") {
      setPrecioLista(Math.round(oferta.neto * 100) / 100);
      return;
    }

    const referencia = COSTOS_RULES.find((c) => {
      if (c.nivel !== nivel || c.modalidad !== modalidad || c.plan !== plan) {
        return false;
      }
      if (requierePlantel && tierResolvido) {
        return c.tier === tierResolvido;
      }
      return true;
    });

    if (!referencia || referencia.porcentaje >= 100) {
      setPrecioLista(null);
      return;
    }

    const base = referencia.monto / (1 - referencia.porcentaje / 100);
    setPrecioLista(Math.round(base * 100) / 100);
  }, [nivel, modalidad, plan, plantel, requierePlantel, tierResolvido]);

  const handleCalcular = () => {
    setError("");
    setResultadoMonto(null);
    setResultadoPorcentaje(null);

    if (!nivel || !modalidad || !plan) {
      setError("Completa nivel, modalidad y plan de estudios.");
      return;
    }

    if (requierePlantel && !plantel) {
      setError("Selecciona un plantel para esta línea de negocio.");
      return;
    }

    if (!promedio) {
      setError("Ingresa el promedio del estudiante.");
      return;
    }

    const promedioNumRaw = Number(String(promedio).replace(",", "."));
    if (Number.isNaN(promedioNumRaw) || promedioNumRaw <= 0 || promedioNumRaw > 10) {
      setError("Ingresa un promedio válido entre 0 y 10.");
      return;
    }

    const promedioNum = Math.round(promedioNumRaw * 10) / 10;

    const programaKey = resolveProgramaKey(programa);

    if (requierePlantel && !tierResolvido) {
      setError("No se encontró el tier para el plantel seleccionado.");
      return;
    }

    const candidatos = COSTOS_RULES.filter((c) => {
      if (c.programa !== programaKey) return false;
      if (c.nivel !== nivel || c.modalidad !== modalidad || c.plan !== plan) {
        return false;
      }
      if (requierePlantel && tierResolvido) {
        return c.tier === tierResolvido;
      }
      return true;
    });

    const match = candidatos.find((c) => {
      const min = c.rango.min - 1e-6;
      const max = c.rango.max + 1e-6;
      return promedioNum >= min && promedioNum <= max;
    });

    if (!match) {
      setError(
        "No se encontró un costo para esa combinación de datos, programa y promedio."
      );
      return;
    }

    let porcentajeAplicado = match.porcentaje;
    if (isRegreso) {
      porcentajeAplicado = Math.min(porcentajeAplicado, 25);
    }

    const plantelKey = modalidad === "online" ? "ONLINE" : plantel;
    const oferta =
      plantelKey && COSTOS_META.planteles?.[plantelKey]?.oferta?.[nivel]?.[
        String(plan)
      ];

    let base: number | null =
      typeof oferta?.neto === "number" ? oferta.neto : null;

    if (base === null) {
      if (match.porcentaje >= 100) {
        setError("No se pudo calcular el precio lista para esta combinación.");
        return;
      }
      base = match.monto / (1 - match.porcentaje / 100);
    }

    const extrasAplicados = isRegreso && extrasActivos ? extrasTotal : 0;
    const baseConExtras = Math.round((base + extrasAplicados) * 100) / 100;
    const montoFinal =
      Math.round(baseConExtras * (1 - porcentajeAplicado / 100) * 100) / 100;

    setResultadoMonto(montoFinal);
    setResultadoPorcentaje(porcentajeAplicado);
  };

  const limpiar = () => {
    setPrograma("nuevo");
    setNivel("");
    setModalidad("");
    setPlan("");
    setPlantel("");
    setPromedio("");
    setResultadoMonto(null);
    setResultadoPorcentaje(null);
    setPrecioLista(null);
    setError("");
    setExtrasActivos(false);
    setExtrasAbiertos(false);
    setExtrasSeleccionados([]);
  };

  return (
    <div
      className={`min-h-screen text-slate-50 flex items-center justify-center p-4 [@media(max-height:700px)]:items-start [@media(max-height:700px)]:p-2 ${
        isRegreso
          ? "bg-gradient-to-br from-violet-950 via-slate-950 to-slate-950"
          : "bg-slate-950"
      }`}
    >
        <div
          className={`w-full max-w-4xl rounded-2xl border bg-slate-900/80 shadow-2xl px-5 py-6 md:px-8 md:py-8 space-y-6 [@media(max-height:700px)]:px-4 [@media(max-height:700px)]:py-4 [@media(max-height:700px)]:space-y-4 ${
            isRegreso
              ? "border-violet-800/50 shadow-violet-500/10"
              : "border-slate-800 shadow-emerald-500/10"
          }`}
        >
	        <header className="text-center">
            <div className="relative">
              <div className="flex flex-col items-center gap-2">
                <img
                  src="/branding/layout-logo-temp.svg"
                  alt="ReCalc Scholarship"
                  className="h-12 sm:h-14 md:h-16 w-auto max-w-[320px] md:max-w-[420px] object-contain drop-shadow-[0_8px_18px_rgba(0,0,0,0.35)]"
                  loading="lazy"
                />
                <p className="text-[11px] text-slate-400">
                  Powered by ReLead © {new Date().getFullYear()}
                </p>
              </div>

              {university === "unidep" && (
                <div className="mt-2 flex justify-end sm:mt-0 sm:absolute sm:right-0 sm:top-12">
                  <span className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900/60 px-2.5 py-1 text-[10px] font-semibold tracking-[0.18em] text-slate-200">
                    UNIDEP
                  </span>
                </div>
              )}
            </div>
	          <p className="text-sm text-slate-300 max-w-2xl mx-auto [@media(max-height:700px)]:hidden">
	            Selecciona la línea de negocio, modalidad, plan de estudios y plantel.
	            Luego ingresa el promedio y obtén el porcentaje de beca y el monto mensual
	            de colegiatura.
	          </p>
	        </header>

        {error && (
          <div className="rounded-xl border border-red-500/60 bg-red-500/10 px-4 py-2 text-sm text-red-100">
            {error}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          <SearchableSelect
            id="programa"
            openId={openSelectId}
            setOpenId={setOpenSelectId}
            label="Programa"
            options={["Nuevo ingreso", "Regreso"]}
            value={programa === "regreso" ? "Regreso" : "Nuevo ingreso"}
            onChange={(val) => {
              setPrograma(val === "Regreso" ? "regreso" : "nuevo");
              setResultadoMonto(null);
              setResultadoPorcentaje(null);
              setError("");
              setExtrasActivos(false);
              setExtrasAbiertos(false);
              setExtrasSeleccionados([]);
            }}
            placeholder="Selecciona programa"
            accent={accent}
          />

          <SearchableSelect
            id="nivel"
            openId={openSelectId}
            setOpenId={setOpenSelectId}
            label="Línea de negocio"
            options={nivelesDisponibles.map((n) => n.charAt(0).toUpperCase() + n.slice(1))}
            value={
              nivel ? nivel.charAt(0).toUpperCase() + nivel.slice(1) : ""
            }
            onChange={(val) => {
              const normalizado = val.toLowerCase() as Nivel;
              setNivel(normalizado);
              setModalidad("");
              setPlan("");
              setPlantel("");
              setResultadoMonto(null);
              setResultadoPorcentaje(null);
              setExtrasActivos(false);
              setExtrasAbiertos(false);
              setExtrasSeleccionados([]);
            }}
            placeholder="Selecciona nivel"
            disabled={!nivelesDisponibles.length}
            accent={accent}
          />

          <SearchableSelect
            id="modalidad"
            openId={openSelectId}
            setOpenId={setOpenSelectId}
            label="Modalidad"
            options={modalidadesDisponibles.map(
              (m) => m.charAt(0).toUpperCase() + m.slice(1)
            )}
            value={
              modalidad
                ? modalidad.charAt(0).toUpperCase() + modalidad.slice(1)
                : ""
            }
            onChange={(val) => {
              const normalizado = val.toLowerCase() as Modalidad;
              setModalidad(normalizado);
              setPlan("");
              setPlantel("");
              setResultadoMonto(null);
              setResultadoPorcentaje(null);
              setExtrasSeleccionados([]);
            }}
            placeholder="Selecciona modalidad"
            disabled={!modalidadesDisponibles.length}
            accent={accent}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <SearchableSelect
            id="plan"
            openId={openSelectId}
            setOpenId={setOpenSelectId}
            label="Plan de estudios (cuatrimestres)"
            options={planesDisponibles.map((p) => `${p} cuatrimestres`)}
            value={plan ? `${plan} cuatrimestres` : ""}
            onChange={(val) => {
              const num = Number(val.split(" ")[0]);
              setPlan(Number.isNaN(num) ? "" : num);
              setResultadoMonto(null);
              setResultadoPorcentaje(null);
              setExtrasSeleccionados([]);
            }}
            placeholder="Selecciona plan"
            disabled={!planesDisponibles.length}
            accent={accent}
          />

          <SearchableSelect
            id="plantel"
            openId={openSelectId}
            setOpenId={setOpenSelectId}
            label={
              requierePlantel
                ? "Plantel"
                : "Plantel (no aplica)"
            }
            options={plantelesDisponibles}
            value={plantel}
            onChange={(val) => {
              setPlantel(val);
              setResultadoMonto(null);
              setResultadoPorcentaje(null);
              setExtrasSeleccionados([]);
            }}
            placeholder={
              requierePlantel
                ? "Selecciona plantel"
                : "No es necesario para este nivel o modalidad"
            }
            disabled={
              !requierePlantel || plantelesDisponibles.length === 0
            }
            accent={accent}
          />
        </div>

        {isRegreso && (
          <section
            className={`rounded-2xl border p-4 md:p-5 ${
              isRegreso
                ? "border-violet-800/50 bg-violet-950/20"
                : "border-slate-800 bg-slate-950/30"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                  Regresos · Costos adicionales
                </p>
                <p className="mt-1 text-sm text-slate-200">
                  Visualiza y (opcionalmente) suma cargos extra al cálculo final.
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Plantel:{" "}
                  <span className="text-slate-200">
                    {plantelResolvido || (requierePlantel ? "Selecciona uno" : "—")}
                  </span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setExtrasAbiertos((v) => !v)}
                className="rounded-xl border border-slate-700 bg-slate-900/40 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-200 hover:border-slate-500 hover:bg-slate-900/60 transition"
              >
                {extrasAbiertos ? "Ocultar" : "Ver lista"}
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (!plantelResolvido || !extrasDisponibles) return;
                    setExtrasActivos((prev) => {
                      const next = !prev;
                      if (next) {
                        setExtrasAbiertos(true);
                      } else {
                        setExtrasSeleccionados([]);
                      }
                      return next;
                    });
                  }}
                  disabled={!plantelResolvido || !extrasDisponibles}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full border transition ${
                    extrasActivos
                      ? "border-violet-300/60 bg-violet-500/80"
                      : "border-slate-600 bg-slate-800/70"
                  } ${
                    !plantelResolvido || !extrasDisponibles
                      ? "cursor-not-allowed opacity-50"
                      : "cursor-pointer"
                  }`}
                  aria-pressed={extrasActivos}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-slate-50 shadow transition ${
                      extrasActivos ? "translate-x-5" : "translate-x-1"
                    }`}
                  />
                </button>
                <div>
                  <p className="text-xs font-semibold text-slate-200">
                    Activar costos adicionales
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Desactivado por default; afecta el precio final (Regresos).
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-[11px] text-slate-400">Total extras</p>
                <p className="text-sm font-semibold text-slate-50">
                  {extrasTotal.toLocaleString("es-MX", {
                    style: "currency",
                    currency: "MXN",
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>

            {extrasAbiertos && (
              <div className="mt-4">
                {!plantelResolvido ? (
                  <div className="rounded-xl border border-slate-800/70 bg-slate-950/30 p-4 text-xs text-slate-300">
                    Selecciona un plantel para ver los cargos disponibles.
                  </div>
                ) : !extrasDisponibles ? (
                  <div className="rounded-xl border border-slate-800/70 bg-slate-950/30 p-4 text-xs text-slate-300">
                    No hay cargos disponibles para este plantel.
                  </div>
                ) : (
                  <div className="grid gap-3 md:grid-cols-2">
                    {Object.entries(extrasDisponibles).map(([categoria, items]) => (
                      <div
                        key={categoria}
                        className="rounded-xl border border-slate-800/70 bg-slate-950/30 p-3"
                      >
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-300">
                          {categoria}
                        </p>
                        <div className="mt-2 space-y-2">
                          {items.map((item) => {
                            const checked = extrasSeleccionados.includes(item.codigo);
                            const disabled = !extrasActivos;
                            return (
                              <label
                                key={item.codigo}
                                className={`flex items-start justify-between gap-3 rounded-lg border px-3 py-2 transition ${
                                  checked
                                    ? "border-violet-500/50 bg-violet-500/10"
                                    : "border-slate-800/70 bg-slate-900/20"
                                } ${disabled ? "opacity-60" : "hover:bg-slate-900/40 cursor-pointer"}`}
                              >
                                <span className="flex items-start gap-2">
                                  <input
                                    type="checkbox"
                                    className="mt-0.5 accent-violet-500"
                                    checked={checked}
                                    disabled={disabled}
                                    onChange={() => {
                                      setExtrasSeleccionados((prev) => {
                                        if (prev.includes(item.codigo)) {
                                          return prev.filter((c) => c !== item.codigo);
                                        }
                                        return [...prev, item.codigo];
                                      });
                                    }}
                                  />
                                  <span>
                                    <span className="block text-xs text-slate-100">
                                      {item.concepto}
                                    </span>
                                    <span className="block text-[11px] text-slate-400">
                                      Código: {item.codigo}
                                    </span>
                                  </span>
                                </span>
                                <span className="text-xs font-semibold text-slate-50">
                                  {item.costo.toLocaleString("es-MX", {
                                    style: "currency",
                                    currency: "MXN",
                                    maximumFractionDigits: 2,
                                  })}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)] items-end">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-300 uppercase tracking-wide">
              Promedio general
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={promedio}
                onChange={(e) => setPromedio(e.target.value)}
                placeholder="Ej. 8.5"
                className={`w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2.5 text-sm text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 ${
                  isRegreso
                    ? "focus:border-violet-400 focus:ring-violet-400/70"
                    : "focus:border-emerald-400 focus:ring-emerald-400/70"
                }`}
              />
              <span className="text-xs text-slate-400 hidden md:inline">
                Usa un decimal
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 justify-end">
            <button
              type="button"
              onClick={limpiar}
              className="rounded-xl border border-slate-600 px-4 py-2 text-xs font-medium uppercase tracking-wide text-slate-200 hover:border-slate-400 hover:bg-slate-800/60 transition"
            >
              Limpiar
            </button>
            <button
              type="button"
              onClick={handleCalcular}
              className={`rounded-xl px-5 py-2.5 text-xs md:text-sm font-semibold uppercase tracking-wide text-slate-950 shadow-md transition ${
                isRegreso
                  ? "bg-violet-500 shadow-violet-500/40 hover:bg-violet-400"
                  : "bg-emerald-500 shadow-emerald-500/40 hover:bg-emerald-400"
              }`}
            >
              Calcular beca
            </button>
          </div>
        </div>

        {precioLista !== null && (
          <section className="mt-4 rounded-2xl border border-slate-700 bg-slate-900/80 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                Precio lista (sin beca)
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-slate-400">
                Mensualidad antes de aplicar beca
              </p>
              <p className="text-xl md:text-2xl font-semibold text-slate-50">
                {precioLista.toLocaleString("es-MX", {
                  style: "currency",
                  currency: "MXN",
                  maximumFractionDigits: 2,
                })}
              </p>
              {isRegreso && extrasActivos && extrasTotal > 0 && (
                <div className="mt-2 text-[11px] text-slate-400 space-y-0.5">
                  <div className="flex items-center justify-end gap-2">
                    <span>Extras:</span>
                    <span className="text-slate-200">
                      {extrasTotal.toLocaleString("es-MX", {
                        style: "currency",
                        currency: "MXN",
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <span>Lista + extras:</span>
                    <span className="text-slate-50 font-semibold">
                      {(precioLista + extrasTotal).toLocaleString("es-MX", {
                        style: "currency",
                        currency: "MXN",
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {resultadoMonto !== null && resultadoPorcentaje !== null && (
          <section
            className={`mt-4 rounded-2xl border p-4 md:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 ${
              isRegreso
                ? "border-violet-500/40 bg-violet-500/10"
                : "border-emerald-500/40 bg-emerald-500/10"
            }`}
          >
            <div>
              <p
                className={`text-xs font-semibold uppercase tracking-wide ${
                  isRegreso ? "text-violet-300" : "text-emerald-300"
                }`}
              >
                Resultado de la beca
              </p>
              <p
                className={`mt-1 text-lg md:text-2xl font-semibold ${
                  isRegreso ? "text-violet-100" : "text-emerald-100"
                }`}
              >
                Beca del {resultadoPorcentaje}%
              </p>
              <p
                className={`mt-1 text-sm ${
                  isRegreso ? "text-violet-50/90" : "text-emerald-50/90"
                }`}
              >
                Monto mensual estimado de colegiatura con beca aplicada.
              </p>
              {isRegreso && extrasActivos && extrasTotal > 0 && (
                <p className="mt-1 text-xs text-violet-200/80">
                  Incluye extras seleccionados:{" "}
                  {extrasTotal.toLocaleString("es-MX", {
                    style: "currency",
                    currency: "MXN",
                    maximumFractionDigits: 2,
                  })}
                </p>
              )}
            </div>
            <div className="text-right">
              <p
                className={`text-xs font-medium ${
                  isRegreso ? "text-violet-200/80" : "text-emerald-200/80"
                }`}
              >
                Colegiatura mensual
              </p>
              <p
                className={`text-2xl md:text-3xl font-bold ${
                  isRegreso ? "text-violet-300" : "text-emerald-300"
                }`}
              >
                {resultadoMonto.toLocaleString("es-MX", {
                  style: "currency",
                  currency: "MXN",
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          </section>
        )}

        <footer className="mt-8 border-t border-slate-800/60 pt-5 text-[11px] text-slate-400 flex flex-col items-center justify-center gap-2 text-center">
          <img
            src="/branding/relead-logo.gif"
            alt="ReLead"
            className="h-10 sm:h-12 w-auto opacity-90"
            loading="lazy"
          />
        </footer>
      </div>
    </div>
  );
};

export default ScholarshipCalculator;
