import { useState, useMemo } from 'react'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectIndicator,
  SelectPopover,
  ListBox,
  ListBoxItem,
  Label,
  Card,
  CardContent,
  Separator,
  Chip,
} from '@heroui/react'
import {
  getSections,
  getDivisions,
  getGroups,
  getClasses,
  getSubclasses,
} from '@bzync/ph-industry-intel'
import type { PsicSection, PsicDivision, PsicGroup, PsicClass, PsicSubclass } from '@bzync/ph-industry-intel'

const allSections = getSections()

export default function CascadeDemo() {
  const [section, setSection] = useState<PsicSection | null>(null)
  const [division, setDivision] = useState<PsicDivision | null>(null)
  const [group, setGroup] = useState<PsicGroup | null>(null)
  const [cls, setCls] = useState<PsicClass | null>(null)
  const [subclass, setSubclass] = useState<PsicSubclass | null>(null)

  const divisions = useMemo(
    () => (section ? getDivisions(section.code) : []),
    [section],
  )
  const groups = useMemo(
    () => (division ? getGroups(division.code) : []),
    [division],
  )
  const classes = useMemo(
    () => (group ? getClasses(group.code) : []),
    [group],
  )
  const subclasses = useMemo(
    () => (cls ? getSubclasses(cls.code) : []),
    [cls],
  )

  function onSection(code: string) {
    setSection(allSections.find((x) => x.code === code) ?? null)
    setDivision(null)
    setGroup(null)
    setCls(null)
    setSubclass(null)
  }

  function onDivision(code: string) {
    setDivision(divisions.find((x) => x.code === code) ?? null)
    setGroup(null)
    setCls(null)
    setSubclass(null)
  }

  function onGroup(code: string) {
    setGroup(groups.find((x) => x.code === code) ?? null)
    setCls(null)
    setSubclass(null)
  }

  function onClass(code: string) {
    setCls(classes.find((x) => x.code === code) ?? null)
    setSubclass(null)
  }

  function onSubclass(code: string) {
    setSubclass(subclasses.find((x) => x.code === code) ?? null)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Section */}
        <div className="sm:col-span-2">
          <Select
            selectedKey={section?.code ?? null}
            onSelectionChange={(key) => key && onSection(String(key))}
          >
            <Label className="text-sm text-foreground-500 mb-1 block">
              Section ({allSections.length})
            </Label>
            <SelectTrigger>
              <SelectValue>{({ selectedText }) => selectedText || 'Select a section'}</SelectValue>
              <SelectIndicator />
            </SelectTrigger>
            <SelectPopover>
              <ListBox>
                {allSections.map((s) => (
                  <ListBoxItem key={s.code} id={s.code} textValue={`[${s.code}] ${s.title}`}>
                    [{s.code}] {s.title}
                  </ListBoxItem>
                ))}
              </ListBox>
            </SelectPopover>
          </Select>
        </div>

        {/* Division */}
        <div>
          <Select
            selectedKey={division?.code ?? null}
            onSelectionChange={(key) => key && onDivision(String(key))}
            isDisabled={divisions.length === 0}
          >
            <Label className="text-sm text-foreground-500 mb-1 block">
              {`Division${divisions.length > 0 ? ` (${divisions.length})` : ''}`}
            </Label>
            <SelectTrigger>
              <SelectValue>
                {({ selectedText }) =>
                  selectedText || (section ? 'Select a division' : 'Select a section first')
                }
              </SelectValue>
              <SelectIndicator />
            </SelectTrigger>
            <SelectPopover>
              <ListBox>
                {divisions.map((d) => (
                  <ListBoxItem key={d.code} id={d.code} textValue={`${d.code} — ${d.title}`}>
                    {d.code} — {d.title}
                  </ListBoxItem>
                ))}
              </ListBox>
            </SelectPopover>
          </Select>
        </div>

        {/* Group */}
        <div>
          <Select
            selectedKey={group?.code ?? null}
            onSelectionChange={(key) => key && onGroup(String(key))}
            isDisabled={groups.length === 0}
          >
            <Label className="text-sm text-foreground-500 mb-1 block">
              {`Group${groups.length > 0 ? ` (${groups.length})` : ''}`}
            </Label>
            <SelectTrigger>
              <SelectValue>
                {({ selectedText }) =>
                  selectedText || (division ? 'Select a group' : 'Select a division first')
                }
              </SelectValue>
              <SelectIndicator />
            </SelectTrigger>
            <SelectPopover>
              <ListBox>
                {groups.map((g) => (
                  <ListBoxItem key={g.code} id={g.code} textValue={`${g.code} — ${g.title}`}>
                    {g.code} — {g.title}
                  </ListBoxItem>
                ))}
              </ListBox>
            </SelectPopover>
          </Select>
        </div>

        {/* Class */}
        <div>
          <Select
            selectedKey={cls?.code ?? null}
            onSelectionChange={(key) => key && onClass(String(key))}
            isDisabled={classes.length === 0}
          >
            <Label className="text-sm text-foreground-500 mb-1 block">
              {`Class${classes.length > 0 ? ` (${classes.length})` : ''}`}
            </Label>
            <SelectTrigger>
              <SelectValue>
                {({ selectedText }) =>
                  selectedText || (group ? 'Select a class' : 'Select a group first')
                }
              </SelectValue>
              <SelectIndicator />
            </SelectTrigger>
            <SelectPopover>
              <ListBox>
                {classes.map((c) => (
                  <ListBoxItem key={c.code} id={c.code} textValue={`${c.code} — ${c.title}`}>
                    {c.code} — {c.title}
                  </ListBoxItem>
                ))}
              </ListBox>
            </SelectPopover>
          </Select>
        </div>

        {/* Subclass */}
        <div>
          <Select
            selectedKey={subclass?.code ?? null}
            onSelectionChange={(key) => key && onSubclass(String(key))}
            isDisabled={subclasses.length === 0}
          >
            <Label className="text-sm text-foreground-500 mb-1 block">
              {`Subclass${subclasses.length > 0 ? ` (${subclasses.length})` : ''}`}
            </Label>
            <SelectTrigger>
              <SelectValue>
                {({ selectedText }) =>
                  selectedText || (cls ? 'Select a subclass' : 'Select a class first')
                }
              </SelectValue>
              <SelectIndicator />
            </SelectTrigger>
            <SelectPopover>
              <ListBox>
                {subclasses.map((sc) => (
                  <ListBoxItem key={sc.code} id={sc.code} textValue={`${sc.code} — ${sc.title}`}>
                    {sc.code} — {sc.title}
                  </ListBoxItem>
                ))}
              </ListBox>
            </SelectPopover>
          </Select>
        </div>
      </div>

      {/* Selected path summary */}
      {section && (
        <Card className="border border-divider bg-content1">
          <div className="px-5 py-3 flex items-center gap-2">
            <span className="text-success text-sm">✓</span>
            <span className="text-sm font-medium text-foreground">Selected path</span>
          </div>
          <Separator />
          <CardContent className="p-5 space-y-3">
            {[
              { label: 'Section', item: section },
              { label: 'Division', item: division },
              { label: 'Group', item: group },
              { label: 'Class', item: cls },
              { label: 'Subclass', item: subclass },
            ].map(({ label, item }) =>
              item ? (
                <div key={label} className="flex items-center gap-3">
                  <Chip size="sm" variant="soft" className="shrink-0 w-20 justify-center">
                    {label}
                  </Chip>
                  <code className="font-mono text-xs bg-content2 text-foreground-600 px-2 py-0.5 rounded shrink-0">
                    {item.code}
                  </code>
                  <span className="text-sm text-foreground truncate">{item.title}</span>
                </div>
              ) : null,
            )}
          </CardContent>
        </Card>
      )}

      {!section && (
        <div className="rounded-xl border-2 border-dashed border-divider p-8 text-center text-foreground-400 text-sm">
          Select a section above to start traversing the PSIC hierarchy
        </div>
      )}
    </div>
  )
}
