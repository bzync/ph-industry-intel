import { useState, useMemo } from 'react'
import { TextField, Label, Input, Chip, Card, CardContent, Separator } from '@heroui/react'
import { getPath, isValidCode } from '@bzync/ph-industry-intel'
import type { PsicPath } from '@bzync/ph-industry-intel'

const PRESETS = [
  { label: 'Section J', code: 'J' },
  { label: 'Division 62', code: '62' },
  { label: 'Group 620', code: '620' },
  { label: 'Class 6201', code: '6201' },
  { label: 'Subclass 62011', code: '62011' },
  { label: 'Section A', code: 'A' },
  { label: 'Division 01', code: '01' },
]

const LEVEL_LABELS: Array<{ key: keyof PsicPath; label: string }> = [
  { key: 'section', label: 'Section' },
  { key: 'division', label: 'Division' },
  { key: 'group', label: 'Group' },
  { key: 'class', label: 'Class' },
  { key: 'subclass', label: 'Subclass' },
]

export default function PathDemo() {
  const [code, setCode] = useState('')

  const path = useMemo<PsicPath | null>(() => {
    const trimmed = code.trim()
    if (!trimmed) return null
    return getPath(trimmed)
  }, [code])

  const valid = useMemo(() => {
    const trimmed = code.trim()
    if (!trimmed) return null
    return isValidCode(trimmed)
  }, [code])

  return (
    <div className="space-y-6">
      <TextField value={code} onChange={setCode} className="max-w-xs">
        <Label className="text-sm text-foreground-500">PSIC code</Label>
        <Input
          type="text"
          placeholder="e.g. 62011"
          className="font-mono text-base"
          autoComplete="off"
          spellCheck={false}
        />
      </TextField>

      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-foreground-400">Try:</span>
        {PRESETS.map((p) => (
          <Chip
            key={p.code}
            variant="soft"
            size="sm"
            className="cursor-pointer"
            onClick={() => setCode(p.code)}
          >
            {p.label}
          </Chip>
        ))}
      </div>

      {!code.trim() && (
        <div className="rounded-xl border-2 border-dashed border-divider p-8 text-center text-foreground-400 text-sm">
          Enter a PSIC code above to resolve its full path
        </div>
      )}

      {code.trim() && valid === false && (
        <Card className="border border-danger/30 bg-danger/5">
          <CardContent className="p-5">
            <p className="text-sm font-medium text-danger">
              &ldquo;{code.trim()}&rdquo; is not a valid PSIC code
            </p>
            <p className="text-foreground-500 mt-1 text-sm">
              Sections use a single letter (A–U). Divisions are 2 digits, groups 3, classes 4, subclasses 5.
            </p>
          </CardContent>
        </Card>
      )}

      {path && (
        <Card className="border border-divider">
          <div className="px-5 py-3 flex items-center gap-2">
            <span className="text-success text-sm">✓</span>
            <span className="text-sm font-medium text-foreground">Full path for</span>
            <code className="font-mono text-sm bg-content2 text-foreground-600 px-2 py-0.5 rounded">
              {code.trim()}
            </code>
          </div>
          <Separator />
          <CardContent className="p-5 space-y-3">
            {LEVEL_LABELS.map(({ key, label }) => {
              const item = path[key]
              if (!item) return null
              return (
                <div key={key} className="flex items-start gap-3">
                  <Chip
                    size="sm"
                    variant="soft"
                    className="shrink-0 w-20 justify-center capitalize"
                  >
                    {label}
                  </Chip>
                  <code className="font-mono text-xs bg-content2 text-foreground-600 px-2 py-0.5 rounded shrink-0 mt-0.5">
                    {item.code}
                  </code>
                  <span className="text-sm text-foreground">{item.title}</span>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
