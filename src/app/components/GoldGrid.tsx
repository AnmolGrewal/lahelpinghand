import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Checkbox, FormGroup, FormControlLabel, Collapse, IconButton } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'; // For a toggle icon
import { Raid } from '../../data/raidsInfo';

interface GoldGridProps {
  raids: Raid[];
}

interface RaidGroup {
  [label: string]: Raid[];
}

const GoldGrid: React.FC<GoldGridProps> = ({ raids }) => {
  const [open, setOpen] = useState<{ [key: string]: boolean }>({});
  const [checkedStates, setCheckedStates] = useState<{ [key: string]: boolean[] }>({});

  useEffect(() => {
    raids.forEach(raid => {
      ['normal', 'hard'].forEach(mode => {
        const fullPath = raid.path + mode;
        if (raid.path.includes(mode)) {
          setCheckedStates(prev => ({
            ...prev,
            [fullPath]: new Array(raid.gateData.gold.length).fill(false) // Initialize with all unchecked
          }));
        }
      });
    });
  }, [raids]);

  const handleToggle = (raidPath: string, mode: 'normal' | 'hard') => {
    const fullPath = raidPath + mode;
    setOpen(prev => ({ ...prev, [fullPath]: !prev[fullPath] }));
  };

  const handleMainCheckboxChange = (raidPath: string, mode: 'normal' | 'hard') => {
    const fullPath = raidPath + mode;
    const allChecked = checkedStates[fullPath]?.every(Boolean);
    setCheckedStates(prev => ({
      ...prev,
      [fullPath]: prev[fullPath] ? prev[fullPath].map(() => !allChecked) : []
    }));
  
    // Update gate checkboxes when main checkbox is changed
    if (mode === 'normal') {
      const raid = raids.find(r => r.path === raidPath);
      const gateCount = raid?.gateData.gold.length || 0;
      const gateStates = new Array(gateCount).fill(!allChecked);
      setCheckedStates(prev => ({
        ...prev,
        [raidPath + 'hard']: prev[raidPath + 'hard'] ? prev[raidPath + 'hard'].map(() => !allChecked) : [],
        [raidPath + 'normal']: gateStates
      }));
    }
  };

  const handleGateCheckboxChange = (raidPath: string, mode: 'normal' | 'hard', index: number) => {
    const fullPath = raidPath + mode;
    setCheckedStates(prev => {
      const currentStates = prev[fullPath] || new Array(raids.find(raid => raid.path === raidPath)?.gateData.gold.length).fill(false);
      currentStates[index] = !currentStates[index];
      return { ...prev, [fullPath]: currentStates };
    });
  };

  const calculateTotalGold = () => {
    return Object.entries(checkedStates).reduce((totalSum, [key, checks]) => {
      const raidPath = key.replace(/normal|hard/, '');
      const raid = raids.find(r => r.path === raidPath);
      const sum = raid ? raid.gateData.gold.reduce((sum, gold, index) => sum + (checks[index] ? gold : 0), 0) : 0;
      return totalSum + sum;
    }, 0);
  };

  const raidGroups: RaidGroup = raids.reduce((acc: RaidGroup, raid: Raid) => {
    const label = raid.label;
    acc[label] = acc[label] || [];
    acc[label].push(raid);
    return acc;
  }, {});

  return (
    <TableContainer component={Paper} sx={{
      width: '100%',
      backgroundColor: 'var(--chip-background-color)',
      color: 'var(--primary-text-color)',
      '.MuiTableCell-root': {
        color: 'var(--primary-text-color)',
        borderBottom: '2px solid var(--primary-text-label-color)',
        paddingLeft: 2,
        paddingRight: 2
      }
    }}>
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold', fontSize: '24px' }}>Raids</TableCell>
            <TableCell sx={{ fontWeight: 'bold', fontSize: '24px' }}>Character 1</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.entries(raidGroups).map(([label, groupedRaids], index) => (
            <TableRow key={index} className={index % 2 === 0 ? 'even-row' : ''}>
              <TableCell component="th" scope="row" sx={{ textAlign: 'left', fontSize: '24px' }}>
                {label}
              </TableCell>
              <TableCell>
                <FormGroup row>
                  {groupedRaids.map((raid: Raid) => {
                    const mode = raid.path.includes('-hard') ? 'hard' : 'normal';
                    const fullPath = raid.path + mode;
                    return (
                      <React.Fragment key={raid.path}>
                        <IconButton onClick={() => handleToggle(raid.path, mode)} size="small">
                          <ExpandMoreIcon />
                        </IconButton>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={checkedStates[fullPath]?.every(Boolean) || false}
                              indeterminate={checkedStates[fullPath]?.some(Boolean) && !checkedStates[fullPath]?.every(Boolean)}
                              onChange={() => handleMainCheckboxChange(raid.path, mode)}
                            />
                          }
                          label={mode.charAt(0).toUpperCase() + mode.slice(1)}
                        />
                        <Collapse in={open[fullPath]} timeout="auto" unmountOnExit>
                          <FormGroup>
                            {raid.gateData.gold.map((_, gateIndex: number) => (
                              <FormControlLabel
                                key={`${raid.path}-gate-${gateIndex}`}
                                control={
                                  <Checkbox
                                    checked={checkedStates[fullPath]?.[gateIndex] || false}
                                    onChange={() => handleGateCheckboxChange(raid.path, mode, gateIndex)}
                                  />
                                }
                                label={`Gate ${gateIndex + 1}`}
                              />
                            ))}
                          </FormGroup>
                        </Collapse>
                      </React.Fragment>
                    );
                  })}
                </FormGroup>
              </TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell colSpan={2} align="right" sx={{ fontWeight: 'bold', fontSize: '24px' }}>
              Total Gold: {calculateTotalGold()}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default GoldGrid;
