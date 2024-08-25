'use client'

import { useState, useEffect, useRef } from 'react'
import { List, ListItem, ListItemText, Box, Stack, Typography, Button, Modal, TextField } from '@mui/material'
import { firestore } from '@/firebase'
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'white',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
}

export default function Home() {
  // Initializing the state variables
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemAmount, setItemAmount] = useState(1);

  // Use refs to store references for each text field in the inventory list
  const amountRefs = useRef({});

  // Function to update the inventory, needs to be asynchronous otherwise the site will be frozen while it fetches
  const updateInventory = async () => {
    const snapshot = query(collection(firestore, "inventory"));
    const docs = await getDocs(snapshot);
    const inventoryList = [];

    docs.forEach((doc) => {
      inventoryList.push({ name: doc.id, ...doc.data() });
    });
    setInventory(inventoryList);
  }

  const addItem = async (item, amount = 1) => {
    const docRef = doc(collection(firestore, "inventory"), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: Number(quantity) + Number(amount) });  // Have to enforce types here otherwise quantity can be handled as a string
    } else {
      await setDoc(docRef, { quantity: amount });
    }
    await updateInventory();
  }

  const removeItem = async (item, amount = 1) => {
    const docRef = doc(collection(firestore, "inventory"), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity - amount < 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - Number(amount) });
      }
    }
    await updateInventory();
  }

  const searchInventory = async (term) => {
    const snapshot = query(collection(firestore, "inventory"));
    const docs = await getDocs(snapshot);
    const inventoryList = [];

    docs.forEach((doc) => {
      inventoryList.push({ name: doc.id, ...doc.data() });
    });

    const filteredItems = inventoryList.filter(item =>
      item.name.toLowerCase().includes(term.toLowerCase())
    );

    setInventory(filteredItems);
  }

  // This function updates whenever something in the dependency array changes, the dependency array is the second argument (the empty array passed)
  useEffect(() => {
    updateInventory();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleAddItem = (name) => {
    const amount = amountRefs.current[name]?.value || 1;
    if (amount > 0) {
      addItem(name, Number(amount));
    }
  };

  const handleRemoveItem = (name) => {
    const amount = amountRefs.current[name]?.value || 1;
    if (amount > 0) {
      removeItem(name, Number(amount));
    }
  };

  return (
    <Box
      width="100vw"
      height="100vh"
      display={'flex'}
      justifyContent={'center'}
      flexDirection={'column'}
      alignItems={'center'}
      gap={2}
      bgcolor="#FFE1E2"
    >
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Add Item
          </Typography>
          <Stack width="100%" direction={'row'} spacing={2}>
            <TextField
              id="outlined-basic"
              label="Item"
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <TextField
              id="outlined-basic"
              type="number"
              label="Amount"
              variant="outlined"
              fullWidth
              value={itemAmount}
              inputProps={{ min: 1 }}
              onChange={(e) => setItemAmount(e.target.value)}
            />
            <Button
              variant="outlined"
              onClick={() => {
                addItem(itemName, itemAmount)
                setItemName('')
                setItemAmount(1)
                handleClose()
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>

      <Stack direction="row" spacing={50}>
        <TextField
          id="search-outlined-basic"
          variant="outlined"
          label="Search"
          onChange={(e) => {searchInventory(e.target.value);}}
          />
        <Button variant="contained" onClick={handleOpen}>
          Add New Item
        </Button>
      </Stack>
      <Box border={'1px solid #333'} height="600px" width="800px" overflow={"auto"}>
        <Box
          // width="800px"
          height="100px"
          bgcolor={'#ADD8E6'}
          display={'flex'}
          justifyContent={'center'}
          alignItems={'center'}
        >
          <Typography variant={'h2'} color={'#333'} textAlign={'center'}>
            Inventory Items
          </Typography>
        </Box>
        <List color="white">
          {inventory.map(({ name, quantity }) => (
            <ListItem
              key={name}
              secondaryAction={
                <Stack direction="row" spacing={1}>
                  <TextField
                    id={`amount-${name}`}
                    type="number"
                    label="Amount"
                    variant="outlined"
                    size="small"
                    defaultValue={1}
                    inputRef={(el) => (amountRefs.current[name] = el)}
                    inputProps={{ min: 0 }}
                  />
                  <Button
                    variant="contained"
                    onClick={() => handleAddItem(name)}
                  >
                    +
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => handleRemoveItem(name)}
                  >
                    -
                  </Button>
                </Stack>
              }
            >
              <ListItemText primary={name} secondary={`Quantity: ${quantity}`} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  )
}
